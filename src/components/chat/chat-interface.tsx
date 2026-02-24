"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { useSandboxStatus } from "@/hooks/use-sandbox-status";
import { ChatHeader } from "./chat-header";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { AgentAvatar } from "@/components/ui/agent-avatar";

interface ChatInterfaceProps {
  agentId: string;
  agentName: string;
  initialSessionId?: string;
}

export function ChatInterface({
  agentId,
  agentName,
  initialSessionId,
}: ChatInterfaceProps) {
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    loadSession,
    clearMessages,
  } = useChat(agentId);

  const { sandboxRunning } = useSandboxStatus(agentId, 15000);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial session
  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    }
  }, [initialSessionId, loadSession]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle mobile keyboard — scroll to bottom when visualViewport resizes
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const onResize = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    viewport.addEventListener("resize", onResize);
    return () => viewport.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        agentName={agentName}
        sandboxRunning={sandboxRunning}
        agentId={agentId}
        onNewChat={clearMessages}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AgentAvatar agentId={agentId} size="lg" className="mb-4" />
              <h3 className="text-lg font-medium text-fg mb-1">
                Chat with {agentName}
              </h3>
              <p className="text-sm text-fg-secondary max-w-sm px-4">
                Send a message to start a conversation. The agent will run in an
                isolated cloud sandbox.
              </p>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  streaming={msg.streaming}
                  agentId={agentId}
                />
              ))}
            </div>
          )}

          {error && (
            <div className="mx-auto max-w-3xl px-4 pb-3">
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
