"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AgentStatusBadge } from "./agent-status-badge";
import { Bot, MessageSquare, Wrench } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { AgentWithTools } from "@/types/agent";

interface AgentCardProps {
  agent: AgentWithTools;
}

export function AgentCard({ agent }: AgentCardProps) {
  const enabledTools = agent.mcpTools.filter((t) => t.enabled).length;

  return (
    <Link href={`/agents/${agent.id}`}>
      <Card className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:border-border-hover">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-bg-tertiary">
                <Bot className="h-4 w-4 text-fg-secondary" />
              </div>
              <div>
                <h3 className="font-medium text-fg group-hover:text-accent transition-colors">
                  {agent.name}
                </h3>
                <p className="text-xs text-fg-tertiary">{agent.model}</p>
              </div>
            </div>
            <AgentStatusBadge status={agent.status} />
          </div>

          {agent.description && (
            <p className="text-sm text-fg-secondary mb-3">
              {truncate(agent.description, 100)}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-fg-tertiary">
            <span className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              {enabledTools} tool{enabledTools !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Chat
            </span>
            <span className="ml-auto">{formatDate(agent.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
