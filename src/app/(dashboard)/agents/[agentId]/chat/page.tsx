import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatInterface } from "@/components/chat/chat-interface";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ agentId: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const user = await requireUser();
  const { agentId } = await params;
  const { session: sessionId } = await searchParams;

  const agent = await db.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent || agent.userId !== user.id) notFound();

  return (
    <div className="h-full -m-4 -mt-14 md:-m-6 md:-mt-6">
      <ChatInterface
        agentId={agent.id}
        agentName={agent.name}
        initialSessionId={sessionId}
      />
    </div>
  );
}
