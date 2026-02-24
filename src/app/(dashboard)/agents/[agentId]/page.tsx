import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AgentDetailClient } from "./agent-detail-client";
import type { AgentWithTools } from "@/types/agent";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const user = await requireUser();
  const { agentId } = await params;

  const agent = (await db.agent.findUnique({
    where: { id: agentId },
    include: { mcpTools: true, sandbox: true },
  })) as AgentWithTools | null;

  if (!agent || agent.userId !== user.id) notFound();

  return <AgentDetailClient agent={agent} />;
}
