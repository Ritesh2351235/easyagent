import type { ChatMessage as PrismaChatMessage, ChatSession, MessageRole } from "@prisma/client";

export type ChatMessageType = PrismaChatMessage;

export type ChatSessionWithMessages = ChatSession & {
  messages: PrismaChatMessage[];
};

export type ChatStreamEvent = {
  type: "delta" | "done" | "error";
  content?: string;
  error?: string;
};

export type SendMessageInput = {
  message: string;
  sessionId?: string;
};

export { MessageRole };
