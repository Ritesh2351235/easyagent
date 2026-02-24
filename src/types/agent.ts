import type { Agent, AgentMCPTool, Sandbox } from "@prisma/client";

export type AgentWithTools = Agent & {
  mcpTools: AgentMCPTool[];
  sandbox: Sandbox | null;
};

export type CreateAgentInput = {
  name: string;
  description?: string;
  instructions?: string;
  model?: string;
};

export type UpdateAgentInput = Partial<CreateAgentInput> & {
  mcpTools?: {
    toolName: string;
    enabled?: boolean;
    config?: Record<string, unknown>;
  }[];
};
