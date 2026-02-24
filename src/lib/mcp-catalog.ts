import type { MCPToolDefinition } from "@/types/mcp";

export const mcpCatalog: MCPToolDefinition[] = [
  {
    name: "hubspot",
    displayName: "HubSpot",
    description:
      "Interact with HubSpot CRM — manage contacts, companies, deals, tickets, and more via the HubSpot API.",
    category: "CRM",
    command: "npx",
    args: ["-y", "@hubspot/mcp-server"],
    configSchema: [
      {
        name: "PRIVATE_APP_ACCESS_TOKEN",
        label: "Private App Access Token",
        type: "password",
        required: true,
        placeholder: "pat-na1-...",
        description:
          "HubSpot Private App access token. Create one at Settings → Integrations → Private Apps.",
      },
    ],
    envVars: { PRIVATE_APP_ACCESS_TOKEN: "" },
  },
  {
    name: "filesystem",
    displayName: "Filesystem",
    description:
      "Read, write, and manage files within the sandbox. Provides directory listing, file creation, reading, and editing capabilities.",
    category: "System",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/workspace"],
    configSchema: [
      {
        name: "rootPath",
        label: "Root Path",
        type: "text",
        placeholder: "/home/user/workspace",
        description: "The root directory the agent can access",
      },
    ],
  },
  {
    name: "brave-search",
    displayName: "Brave Search",
    description:
      "Search the web using Brave Search API. Enables the agent to find current information online.",
    category: "Search",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    configSchema: [
      {
        name: "BRAVE_API_KEY",
        label: "Brave API Key",
        type: "password",
        required: true,
        placeholder: "BSA...",
        description: "Your Brave Search API key",
      },
    ],
    envVars: { BRAVE_API_KEY: "" },
  },
  {
    name: "github",
    displayName: "GitHub",
    description:
      "Interact with GitHub repositories. Create issues, pull requests, search code, and manage repos.",
    category: "Development",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    configSchema: [
      {
        name: "GITHUB_PERSONAL_ACCESS_TOKEN",
        label: "GitHub Token",
        type: "password",
        required: true,
        placeholder: "ghp_...",
        description: "Personal access token with repo permissions",
      },
    ],
    envVars: { GITHUB_PERSONAL_ACCESS_TOKEN: "" },
  },
  {
    name: "sqlite",
    displayName: "SQLite",
    description:
      "Create and query SQLite databases. Perfect for data analysis, storage, and structured data operations.",
    category: "Database",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite", "/home/user/data.db"],
    configSchema: [
      {
        name: "dbPath",
        label: "Database Path",
        type: "text",
        placeholder: "/home/user/data.db",
        description: "Path to the SQLite database file",
      },
    ],
  },
  {
    name: "memory",
    displayName: "Memory",
    description:
      "Persistent key-value memory for the agent. Store and retrieve information across conversations.",
    category: "Utility",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    configSchema: [],
  },
  {
    name: "custom",
    displayName: "Custom MCP Server",
    description:
      "Add any MCP server by specifying its npx package or command. Use this for servers not in the catalog.",
    category: "Custom",
    command: "npx",
    args: ["-y"],
    configSchema: [
      {
        name: "package",
        label: "NPM Package",
        type: "text",
        required: true,
        placeholder: "@company/mcp-server",
        description: "The npm package name (e.g. @company/mcp-server)",
      },
      {
        name: "extraArgs",
        label: "Extra Arguments",
        type: "text",
        placeholder: "--port 3000",
        description: "Additional CLI arguments (optional)",
      },
      {
        name: "envKey1",
        label: "Env Variable Name",
        type: "text",
        placeholder: "API_KEY",
        description: "Environment variable name (optional)",
      },
      {
        name: "envValue1",
        label: "Env Variable Value",
        type: "password",
        placeholder: "sk-...",
        description: "Environment variable value (optional)",
      },
    ],
  },
];

export function getMCPTool(name: string): MCPToolDefinition | undefined {
  return mcpCatalog.find((t) => t.name === name);
}
