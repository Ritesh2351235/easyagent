import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateAgentSchema } from "@/lib/validations/agent";
import { handleApiError, NotFoundError, UnauthorizedError } from "@/lib/errors";

async function getAgentForUser(agentId: string, userId: string) {
  const agent = await db.agent.findUnique({
    where: { id: agentId },
    include: { mcpTools: true, sandbox: true },
  });
  if (!agent) throw new NotFoundError("Agent not found");
  if (agent.userId !== userId) throw new UnauthorizedError();
  return agent;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const user = await requireUser();
    const { agentId } = await params;
    const agent = await getAgentForUser(agentId, user.id);
    return NextResponse.json(agent);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const user = await requireUser();
    const { agentId } = await params;
    await getAgentForUser(agentId, user.id);

    const body = await req.json();
    const { mcpTools, ...data } = updateAgentSchema.parse(body);

    const agent = await db.agent.update({
      where: { id: agentId },
      data,
      include: { mcpTools: true, sandbox: true },
    });

    if (mcpTools) {
      for (const tool of mcpTools) {
        await db.agentMCPTool.upsert({
          where: {
            agentId_toolName: { agentId, toolName: tool.toolName },
          },
          update: {
            enabled: tool.enabled ?? true,
            config: (tool.config ?? {}) as Prisma.InputJsonValue,
          },
          create: {
            agentId,
            toolName: tool.toolName,
            enabled: tool.enabled ?? true,
            config: (tool.config ?? {}) as Prisma.InputJsonValue,
          },
        });
      }
    }

    const updated = await db.agent.findUnique({
      where: { id: agentId },
      include: { mcpTools: true, sandbox: true },
    });

    return NextResponse.json(updated);
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
    await getAgentForUser(agentId, user.id);

    await db.agent.delete({ where: { id: agentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
