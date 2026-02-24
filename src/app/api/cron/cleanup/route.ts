import { NextResponse } from "next/server";
import { cleanupStaleSandboxes } from "@/lib/sandbox-cleanup";

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupStaleSandboxes();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Cleanup cron failed:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
