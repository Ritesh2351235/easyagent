import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SandboxManager } from "@/lib/e2b";
import { handleApiError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { AgentWithTools } from "@/types/agent";

export async function POST(
  _req: Request,
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

    const { host } = await SandboxManager.getOrCreateSandbox(agent);

    return NextResponse.json({
      status: "running",
      host,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const user = await requireUser();
    const { agentId } = await params;

    const agent = await db.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundError("Agent not found");
    if (agent.userId !== user.id) throw new UnauthorizedError();

    await SandboxManager.stopSandbox(agentId);

    return NextResponse.json({ status: "stopped" });
  } catch (error) {
    return handleApiError(error);
  }
}
