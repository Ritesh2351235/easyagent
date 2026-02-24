"use client";

import Link from "next/link";
import { AgentCard } from "./agent-card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import type { AgentWithTools } from "@/types/agent";

interface AgentListProps {
  agents: AgentWithTools[];
}

export function AgentList({ agents }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Logo size="lg" className="mb-4" />
        <h3 className="text-lg font-medium text-fg mb-2">No agents yet</h3>
        <p className="text-sm text-fg-secondary mb-6 max-w-sm">
          Create your first AI agent to get started. Each agent runs in its own
          isolated cloud sandbox.
        </p>
        <Link href="/agents/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
