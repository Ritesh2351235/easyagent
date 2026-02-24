import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { StreamingIndicator } from "./streaming-indicator";

interface ChatMessageProps {
  role: "USER" | "ASSISTANT";
  content: string;
  streaming?: boolean;
  agentId?: string;
}

export function ChatMessage({ role, content, streaming, agentId }: ChatMessageProps) {
  const isUser = role === "USER";

  return (
    <div className={cn("flex gap-3 py-4", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-fg text-bg">
          <User className="h-4 w-4" />
        </div>
      ) : (
        <AgentAvatar agentId={agentId || "default"} size="sm" />
      )}
      <div
        className={cn(
          "flex-1 space-y-2 overflow-hidden",
          isUser && "text-right"
        )}
      >
        <div
          className={cn(
            "inline-block rounded-lg px-4 py-2.5 text-sm max-w-[85%]",
            isUser
              ? "bg-fg text-bg"
              : "bg-bg-secondary border border-border text-fg"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_pre]:bg-bg-tertiary [&_pre]:rounded-md [&_pre]:p-3 [&_code]:text-accent [&_code]:font-mono [&_code]:text-xs">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : streaming ? null : (
                <p className="text-fg-tertiary italic">Empty response</p>
              )}
              {streaming && <StreamingIndicator />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
