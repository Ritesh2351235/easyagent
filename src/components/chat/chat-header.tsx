"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Bot } from "lucide-react";

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
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <Link href={`/agents/${agentId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-bg-tertiary">
          <Bot className="h-4 w-4 text-fg-secondary" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-fg">{agentName}</h2>
          <div className="flex items-center gap-2">
            <Badge variant={sandboxRunning ? "success" : "default"}>
              {sandboxRunning ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onNewChat}>
        <Plus className="h-3.5 w-3.5" />
        New Chat
      </Button>
    </div>
  );
}
