import { Badge } from "@/components/ui/badge";
import type { AgentStatus } from "@prisma/client";

const statusConfig: Record<AgentStatus, { label: string; variant: "default" | "success" | "destructive" }> = {
  IDLE: { label: "Idle", variant: "default" },
  RUNNING: { label: "Running", variant: "success" },
  ERROR: { label: "Error", variant: "destructive" },
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
