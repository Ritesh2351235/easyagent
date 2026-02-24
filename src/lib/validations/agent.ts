import { z } from "zod";

export const createAgentSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  instructions: z
    .string()
    .max(10000, "Instructions must be 10000 characters or less")
    .optional(),
  model: z.string().optional(),
});

export const updateAgentSchema = createAgentSchema.partial().extend({
  mcpTools: z
    .array(
      z.object({
        toolName: z.string(),
        enabled: z.boolean().optional(),
        config: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
});
