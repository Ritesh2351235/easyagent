"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { ArrowLeft, Plus } from "lucide-react";

interface ChatHeaderProps {
  agentName: string;
  sandboxRunning: boolean;
  agentId: string;
  onNewChat: () => void;
}

export function ChatHeader({
  agentName,
  sandboxRunning,
  agentId,
  onNewChat,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4 sm:py-3 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Link href={`/agents/${agentId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <AgentAvatar agentId={agentId} size="sm" />
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-fg truncate">{agentName}</h2>
          <Badge variant={sandboxRunning ? "success" : "default"} className="mt-0.5">
            {sandboxRunning ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onNewChat} className="shrink-0">
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">New Chat</span>
      </Button>
    </div>
  );
}
