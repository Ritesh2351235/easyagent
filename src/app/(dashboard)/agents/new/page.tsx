"use client";

import { Header } from "@/components/layout/header";
import { AgentForm } from "@/components/agents/agent-form";

export default function NewAgentPage() {
  return (
    <div>
      <Header
        title="Create Agent"
        description="Configure a new AI agent with its own cloud sandbox"
      />
      <AgentForm mode="create" />
    </div>
  );
}
