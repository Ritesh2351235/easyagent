import type { SandboxStatus } from "@prisma/client";

export type SandboxInfo = {
  id: string;
  e2bId: string;
  status: SandboxStatus;
  host: string | null;
  port: number;
  lastActive: Date;
};

export { SandboxStatus };
