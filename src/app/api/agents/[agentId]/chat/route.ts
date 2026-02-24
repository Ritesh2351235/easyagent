import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SandboxManager } from "@/lib/e2b";
import { handleApiError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { CHAT_CONFIG } from "@/lib/constants";
import type { AgentWithTools } from "@/types/agent";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const user = await requireUser();
    const { agentId } = await params;

    const agent = await db.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundError("Agent not found");
    if (agent.userId !== user.id) throw new UnauthorizedError();

    const sessions = await db.chatSession.findMany({
      where: { agentId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const user = await requireUser();
    const { agentId } = await params;

    const agent = (await db.agent.findUnique({
      where: { id: agentId },
      include: { mcpTools: true, sandbox: true },
    })) as AgentWithTools | null;

    if (!agent) throw new NotFoundError("Agent not found");
    if (agent.userId !== user.id) throw new UnauthorizedError();

    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    if (message.length > CHAT_CONFIG.maxMessageLength) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Ensure sandbox is running
    const { host } = await SandboxManager.getOrCreateSandbox(agent);

    // Get or create session
    let session;
    if (sessionId) {
      session = await db.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
      if (!session || session.agentId !== agentId) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    } else {
      session = await db.chatSession.create({
        data: {
          agentId,
          title: message.slice(0, 50),
        },
        include: { messages: true },
      });
    }

    // Persist user message
    await db.chatMessage.create({
      data: {
        role: "USER",
        content: message,
        sessionId: session.id,
      },
    });

    // Build history for relay
    const history = session.messages.map((m) => ({
      role: m.role.toLowerCase(),
      content: m.content,
    }));

    // Stream from relay
    const relayUrl = `https://${host}/chat`;
    const relayRes = await fetch(relayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!relayRes.ok || !relayRes.body) {
      return NextResponse.json(
        { error: "Failed to connect to agent sandbox" },
        { status: 502 }
      );
    }

    // Create a TransformStream to capture the full response for persistence
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = relayRes.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            controller.enqueue(new TextEncoder().encode(text));

            // Parse SSE lines to accumulate response
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === "delta" && data.content) {
                    fullResponse += data.content;
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (err) {
          const errorMsg = JSON.stringify({ type: "error", error: "Stream interrupted" });
          controller.enqueue(new TextEncoder().encode(`data: ${errorMsg}\n\n`));
        } finally {
          // Persist assistant response
          if (fullResponse) {
            await db.chatMessage.create({
              data: {
                role: "ASSISTANT",
                content: fullResponse,
                sessionId: session.id,
              },
            });
            await db.chatSession.update({
              where: { id: session.id },
              data: { updatedAt: new Date() },
            });
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Session-Id": session.id,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
