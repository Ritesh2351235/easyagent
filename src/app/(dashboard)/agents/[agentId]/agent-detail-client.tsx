"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentStatusBadge } from "@/components/agents/agent-status-badge";
import { AgentForm } from "@/components/agents/agent-form";
import { MCPToolSelector } from "@/components/mcp/mcp-tool-selector";
import { useToast } from "@/components/ui/toast";
import {
  MessageSquare,
  Play,
  Square,
  Pencil,
  Trash2,
  Wrench,
  Plus,
} from "lucide-react";
import type { AgentWithTools } from "@/types/agent";

interface AgentDetailClientProps {
  agent: AgentWithTools;
}

export function AgentDetailClient({ agent: initialAgent }: AgentDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [agent, setAgent] = useState(initialAgent);
  const [editing, setEditing] = useState(false);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showToolSelector, setShowToolSelector] = useState(false);

  const handleStartSandbox = async () => {
    setSandboxLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/sandbox`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Sandbox started", "success");
      router.refresh();
      const updated = await fetch(`/api/agents/${agent.id}`).then((r) => r.json());
      setAgent(updated);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to start sandbox", "error");
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleStopSandbox = async () => {
    setSandboxLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}/sandbox`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Sandbox stopped", "success");
      router.refresh();
      const updated = await fetch(`/api/agents/${agent.id}`).then((r) => r.json());
      setAgent(updated);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to stop sandbox", "error");
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/agents/${agent.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      toast("Agent deleted", "success");
      router.push("/dashboard");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveTool = async (toolName: string) => {
    try {
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcpTools: agent.mcpTools
            .filter((t) => t.toolName !== toolName)
            .map((t) => ({
              toolName: t.toolName,
              enabled: t.enabled,
              config: t.config,
            })),
        }),
      });
      if (!res.ok) throw new Error("Failed to remove tool");
      const updated = await res.json();
      setAgent(updated);
      toast("Tool removed", "success");
    } catch {
      toast("Failed to remove tool", "error");
    }
  };

  const handleToolsAdded = async () => {
    const updated = await fetch(`/api/agents/${agent.id}`).then((r) => r.json());
    setAgent(updated);
    setShowToolSelector(false);
  };

  if (editing) {
    return (
      <div>
        <Header title="Edit Agent" />
        <AgentForm agent={agent} mode="edit" />
      </div>
    );
  }

  const enabledTools = agent.mcpTools.filter((t) => t.enabled);

  return (
    <div>
      <Header title={agent.name}>
        <div className="flex items-center gap-2">
          <AgentStatusBadge status={agent.status} />
          {agent.status === "RUNNING" || agent.sandbox?.status === "RUNNING" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopSandbox}
              loading={sandboxLoading}
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartSandbox}
              loading={sandboxLoading}
            >
              <Play className="h-3.5 w-3.5" />
              Start
            </Button>
          )}
          <Link href={`/agents/${agent.id}/chat`}>
            <Button size="sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </Button>
          </Link>
        </div>
      </Header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configuration</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-xs text-fg-tertiary">Model</span>
              <p className="text-sm text-fg">{agent.model}</p>
            </div>
            {agent.description && (
              <div>
                <span className="text-xs text-fg-tertiary">Description</span>
                <p className="text-sm text-fg">{agent.description}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-fg-tertiary">Instructions</span>
              <p className="text-sm text-fg-secondary whitespace-pre-wrap">
                {agent.instructions}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>MCP Tools</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowToolSelector(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add Tool
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {enabledTools.length === 0 ? (
              <div className="text-center py-6">
                <Wrench className="h-8 w-8 text-fg-tertiary mx-auto mb-2" />
                <p className="text-sm text-fg-secondary">No tools attached</p>
                <p className="text-xs text-fg-tertiary mt-1">
                  Add MCP tools to extend your agent&apos;s capabilities
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {enabledTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-fg-tertiary" />
                      <span className="text-sm text-fg">{tool.toolName}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveTool(tool.toolName)}
                      className="text-fg-tertiary hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          loading={deleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Agent
        </Button>
      </div>

      {showToolSelector && (
        <MCPToolSelector
          agentId={agent.id}
          existingTools={agent.mcpTools.map((t) => t.toolName)}
          onClose={() => setShowToolSelector(false)}
          onToolsAdded={handleToolsAdded}
        />
      )}
    </div>
  );
}
