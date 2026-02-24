import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AgentForm } from "@/components/agents/agent-form";
import { Header } from "@/components/layout/header";
import type { AgentWithTools } from "@/types/agent";

export default async function AgentSettingsPage({
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

  return (
    <div>
      <Header title="Agent Settings" description={`Configure ${agent.name}`} />
      <AgentForm agent={agent} mode="edit" />
    </div>
  );
}
