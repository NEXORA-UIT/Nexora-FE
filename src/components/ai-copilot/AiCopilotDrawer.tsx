import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Trash2, Maximize2, Bot } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useAiCopilotStore } from "@/stores/ai-copilot.store";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatInputBar } from "./ChatInputBar";
import { PromptSuggestionsBar, PromptSuggestionsGrid } from "./PromptSuggestionsBar";
import { cn } from "@/lib/utils";

export interface AiCopilotDrawerProps {
  boardId: string;
  boardTitle?: string;
  onSelectCard?: (cardId: string) => void;
  className?: string;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  boardId,
  boardTitle,
  onSelectCard,
  className,
}) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    closeDrawer,
    threads,
    isThinking,
    thinkingStep,
    sendMessage,
    clearThread,
    setActiveBoardId,
  } = useAiCopilotStore();

  const messages = threads[boardId] || [];

  // Sync activeBoardId when drawer opens for this board
  useEffect(() => {
    if (isOpen && boardId) {
      setActiveBoardId(boardId);
    }
  }, [isOpen, boardId, setActiveBoardId]);

  // Auto-scroll to bottom on new messages or thinking change
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isThinking, isOpen]);

  if (!isOpen) return null;

  const handleSend = (text: string) => {
    sendMessage(text, boardId);
  };

  const handleClear = () => {
    clearThread(boardId);
  };

  const handleExpandToFullPage = () => {
    navigate(`${ROUTES.AI_ASSISTANT}?boardId=${boardId}`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 sm:hidden"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-40 h-full w-full sm:w-[460px] bg-white border-l border-neutral-200/90 shadow-2xl flex flex-col transition-all duration-300 ease-in-out",
          className
        )}
        aria-label="AI Copilot Drawer"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-neutral-900 truncate">AI Copilot</h2>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-100 text-primary-700 rounded-md">
                  BETA
                </span>
              </div>
              <p className="text-xs text-neutral-500 truncate">
                {boardTitle ? `Bảng: ${boardTitle}` : "Trợ lý phân tích bảng thông minh"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                title="Xóa hội thoại"
                aria-label="Xóa hội thoại"
                className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleExpandToFullPage}
              title="Mở toàn màn hình"
              aria-label="Mở toàn màn hình"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={closeDrawer}
              title="Đóng"
              aria-label="Đóng"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-neutral-800">
                Xin chào! Tôi có thể giúp gì cho bạn?
              </h3>
              <p className="text-xs text-neutral-500 max-w-[320px] mt-1">
                Tôi có thể phân tích các thẻ công việc, tiến độ, cảnh báo quá hạn và hỗ trợ quản lý
                bảng này.
              </p>

              <PromptSuggestionsGrid onSelectPrompt={handleSend} />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} onSelectCard={onSelectCard} />
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex items-start gap-2.5 mb-4 animate-in fade-in duration-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-medium text-primary-700">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600" />
                      </span>
                      <span>{thinkingStep || "AI đang phân tích dữ liệu bảng..."}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer Area */}
        <div className="shrink-0 bg-white">
          {messages.length > 0 && <PromptSuggestionsBar onSelectPrompt={handleSend} />}
          <ChatInputBar onSendMessage={handleSend} isThinking={isThinking} />
        </div>
      </aside>
    </>
  );
};
