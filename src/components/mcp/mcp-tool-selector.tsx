"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { MCPToolCard } from "./mcp-tool-card";
import { MCPConfigForm } from "./mcp-config-form";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import type { MCPToolDefinition } from "@/types/mcp";

interface MCPToolSelectorProps {
  agentId: string;
  existingTools: string[];
  onClose: () => void;
  onToolsAdded: () => void;
}

export function MCPToolSelector({
  agentId,
  existingTools,
  onClose,
  onToolsAdded,
}: MCPToolSelectorProps) {
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<MCPToolDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<MCPToolDefinition | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/mcp-tools")
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => toast("Failed to load tools", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleAddTool = async (config: Record<string, unknown>) => {
    if (!selectedTool) return;
    setSaving(true);

    try {
      const envVars: Record<string, string> = {};
      let toolName = selectedTool.name;
      let command = selectedTool.command;
      let args = [...selectedTool.args];

      if (selectedTool.name === "custom") {
        // Custom tool: build command from user-provided package name
        const pkg = config.package as string;
        if (!pkg) throw new Error("Package name is required");

        toolName = `custom:${pkg}`;
        command = "npx";
        args = ["-y", pkg];

        // Append extra args if provided
        const extraArgs = (config.extraArgs as string)?.trim();
        if (extraArgs) {
          args.push(...extraArgs.split(/\s+/));
        }

        // Build env from key/value pairs
        const envKey = (config.envKey1 as string)?.trim();
        const envValue = (config.envValue1 as string)?.trim();
        if (envKey && envValue) {
          envVars[envKey] = envValue;
        }
      } else {
        // Standard catalog tool: extract env vars from password fields
        for (const field of selectedTool.configSchema) {
          const value = config[field.name];
          if (value && field.type === "password") {
            envVars[field.name] = value as string;
          }
        }
      }

      const toolConfig = {
        command,
        args,
        env: { ...(selectedTool.envVars || {}), ...envVars },
      };

      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcpTools: [
            {
              toolName,
              enabled: true,
              config: toolConfig,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed to add tool");

      toast(`${selectedTool.displayName} added`, "success");
      onToolsAdded();
    } catch {
      toast("Failed to add tool", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogClose onClick={onClose} />
        <DialogHeader>
          <DialogTitle>
            {selectedTool ? `Configure ${selectedTool.displayName}` : "Add MCP Tool"}
          </DialogTitle>
          <DialogDescription>
            {selectedTool
              ? "Configure the tool before adding it to your agent."
              : "Browse available tools to extend your agent's capabilities."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <Spinner className="py-12" />
        ) : selectedTool ? (
          <MCPConfigForm
            fields={selectedTool.configSchema}
            onSubmit={handleAddTool}
            onCancel={() => setSelectedTool(null)}
            loading={saving}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            {catalog.map((tool) => (
              <MCPToolCard
                key={tool.name}
                tool={tool}
                isAttached={existingTools.includes(tool.name)}
                onSelect={setSelectedTool}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
