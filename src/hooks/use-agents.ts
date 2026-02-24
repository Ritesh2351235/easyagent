"use client";

import { useState, useEffect, useCallback } from "react";
import type { AgentWithTools, CreateAgentInput, UpdateAgentInput } from "@/types/agent";

export function useAgents() {
  const [agents, setAgents] = useState<AgentWithTools[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch agents");
      const data = await res.json();
      setAgents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (input: CreateAgentInput) => {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create agent");
    }
    const agent = await res.json();
    setAgents((prev) => [agent, ...prev]);
    return agent;
  };

  const updateAgent = async (id: string, input: UpdateAgentInput) => {
    const res = await fetch(`/api/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update agent");
    }
    const agent = await res.json();
    setAgents((prev) => prev.map((a) => (a.id === id ? agent : a)));
    return agent;
  };

  const deleteAgent = async (id: string) => {
    const res = await fetch(`/api/agents/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete agent");
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return { agents, loading, error, fetchAgents, createAgent, updateAgent, deleteAgent };
}
