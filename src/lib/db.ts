import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: appendConnectionParams(process.env.DATABASE_URL || ""),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** Add timeout params for Neon free-tier cold starts */
function appendConnectionParams(url: string) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}connect_timeout=30&pool_timeout=30`;
}
