import { Sandbox } from "@e2b/sdk";
import { db } from "./db";

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

export async function cleanupStaleSandboxes() {
  const staleDate = new Date(Date.now() - STALE_THRESHOLD_MS);

  const staleSandboxes = await db.sandbox.findMany({
    where: {
      status: "RUNNING",
      lastActive: { lt: staleDate },
    },
  });

  let cleaned = 0;

  for (const sandbox of staleSandboxes) {
    try {
      const e2bSandbox = await Sandbox.connect(sandbox.e2bId, {
        apiKey: process.env.E2B_API_KEY!,
      });
      await e2bSandbox.kill();
    } catch {
      // Sandbox already dead
    }

    await db.sandbox.delete({ where: { id: sandbox.id } });
    await db.agent.update({
      where: { id: sandbox.agentId },
      data: { status: "IDLE" },
    });
    cleaned++;
  }

  return { cleaned, total: staleSandboxes.length };
}
