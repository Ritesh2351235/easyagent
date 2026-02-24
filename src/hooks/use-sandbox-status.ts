"use client";

import { useState, useEffect, useCallback } from "react";
import type { AgentStatus } from "@prisma/client";

interface SandboxStatus {
  agentStatus: AgentStatus;
  sandboxRunning: boolean;
}

export function useSandboxStatus(agentId: string, pollInterval = 10000) {
  const [status, setStatus] = useState<SandboxStatus>({
    agentStatus: "IDLE",
    sandboxRunning: false,
  });

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (res.ok) {
        const agent = await res.json();
        setStatus({
          agentStatus: agent.status,
          sandboxRunning: agent.sandbox?.status === "RUNNING",
        });
      }
    } catch {
      // Silently ignore poll errors
    }
  }, [agentId]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, pollInterval);
    return () => clearInterval(interval);
  }, [checkStatus, pollInterval]);

  return status;
}
