import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

/** Retry a DB operation up to 3 times to handle Neon cold starts. */
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Can't reach database server") ||
          error.message.includes("Connection refused") ||
          error.message.includes("connect_timeout"));
      if (!isConnectionError || i === retries - 1) throw error;
      // Wait before retry — gives Neon time to wake up
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Unreachable");
}

/**
 * Get the current user from DB, auto-creating/updating from Clerk on first visit.
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const user = await withRetry(() =>
    db.user.upsert({
      where: { clerkId: clerkUser.id },
      update: { email, name, imageUrl: clerkUser.imageUrl },
      create: {
        clerkId: clerkUser.id,
        email,
        name,
        imageUrl: clerkUser.imageUrl,
      },
    })
  );

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
