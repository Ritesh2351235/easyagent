"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/lib/constants";
import type { AgentWithTools, CreateAgentInput } from "@/types/agent";

interface AgentFormProps {
  agent?: AgentWithTools;
  mode: "create" | "edit";
}

export function AgentForm({ agent, mode }: AgentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateAgentInput>({
    name: agent?.name ?? "",
    description: agent?.description ?? "",
    instructions: agent?.instructions ?? "You are a helpful assistant.",
    model: agent?.model ?? DEFAULT_MODEL,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast("Name is required", "error");
      return;
    }
    setLoading(true);

    try {
      const url = mode === "create" ? "/api/agents" : `/api/agents/${agent!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();
      toast(
        mode === "create" ? "Agent created" : "Agent updated",
        "success"
      );
      router.push(`/agents/${data.id}`);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <Input
        id="name"
        label="Name"
        placeholder="My AI Agent"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <Input
        id="description"
        label="Description"
        placeholder="A brief description of what this agent does..."
        value={form.description ?? ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Textarea
        id="instructions"
        label="System Instructions"
        placeholder="You are a helpful assistant..."
        rows={5}
        value={form.instructions ?? ""}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-fg-secondary">Model</label>
        <div className="flex gap-3">
          {AVAILABLE_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setForm({ ...form, model: m.id })}
              className={`flex-1 rounded-md border px-3 py-2.5 text-left transition-colors ${
                form.model === m.id
                  ? "border-fg-tertiary bg-bg-tertiary"
                  : "border-border hover:border-border-hover"
              }`}
            >
              <div className="text-sm font-medium text-fg">{m.name}</div>
              <div className="text-xs text-fg-tertiary">{m.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {mode === "create" ? "Create Agent" : "Save Changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
