"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isStreaming || disabled) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="shrink-0 border-t border-border bg-bg px-3 py-2.5 sm:px-4 sm:py-3 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-[16px] sm:text-sm text-fg placeholder:text-fg-tertiary focus:border-fg-tertiary focus:outline-none disabled:opacity-50 leading-normal"
        />
        {isStreaming ? (
          <Button variant="outline" size="icon" onClick={onStop} className="shrink-0 h-10 w-10 sm:h-9 sm:w-9 rounded-xl">
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="shrink-0 h-10 w-10 sm:h-9 sm:w-9 rounded-xl"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
