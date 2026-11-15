import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  isThinking?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isThinking = false,
  placeholder = "Hỏi AI Copilot về bảng này...",
  className,
  disabled = false,
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || isThinking || disabled) return;

    onSendMessage(value.trim());
    setValue("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("p-3 bg-white border-t border-neutral-200", className)}>
      <div className="flex items-end gap-2 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isThinking}
          rows={1}
          className="flex-1 bg-transparent resize-none border-0 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-0 max-h-[120px] py-1 leading-relaxed"
        />

        <button
          type="submit"
          disabled={!value.trim() || isThinking || disabled}
          aria-label="Gửi"
          className={cn(
            "p-2 rounded-lg transition-all shrink-0 cursor-pointer",
            value.trim() && !isThinking && !disabled
              ? "bg-primary-600 text-white hover:bg-primary-700 shadow-xs active:scale-95"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          )}
        >
          {isThinking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 mt-1.5">
        <span>Nhấn Enter để gửi, Shift + Enter để xuống dòng</span>
      </div>
    </form>
  );
};
