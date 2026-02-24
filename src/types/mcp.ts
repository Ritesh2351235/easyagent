export type MCPConfigField = {
  name: string;
  label: string;
  type: "text" | "password" | "select" | "boolean";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  description?: string;
};

export type MCPToolDefinition = {
  name: string;
  displayName: string;
  description: string;
  category: string;
  command: string;
  args: string[];
  configSchema: MCPConfigField[];
  envVars?: Record<string, string>;
};
