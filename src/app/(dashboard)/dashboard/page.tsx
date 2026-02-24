import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { AgentList } from "@/components/agents/agent-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { AgentWithTools } from "@/types/agent";

export default async function DashboardPage() {
  const user = await requireUser();

  const agents = (await db.agent.findMany({
    where: { userId: user.id },
    include: { mcpTools: true, sandbox: true },
    orderBy: { createdAt: "desc" },
  })) as AgentWithTools[];

  return (
    <div>
      <Header title="Dashboard" description="Manage your AI agents">
        <Link href="/agents/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Agent
          </Button>
        </Link>
      </Header>
      <AgentList agents={agents} />
    </div>
  );
}
