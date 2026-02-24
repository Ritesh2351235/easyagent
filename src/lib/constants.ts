export const APP_NAME = "AgentForge";

export const DEFAULT_MODEL = "gpt-4o-mini";

export const AVAILABLE_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable" },
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable" },
] as const;

export const SANDBOX_CONFIG = {
  port: 8080,
  timeout: 10 * 60 * 1000, // 10 minutes
  healthCheckAttempts: 30,
  healthCheckInterval: 1000, // 1 second
} as const;

export const CHAT_CONFIG = {
  maxMessageLength: 10000,
  rateLimit: 20, // messages per minute
} as const;
