import React from "react";
import { Sparkles, User, AlertTriangle, Info } from "lucide-react";
import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { ReferencedCardsBlock } from "./ReferencedCardsBlock";
import { CitationsBlock } from "./CitationsBlock";
import { InlineCardBadge } from "./InlineCardBadge";

export interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectCard?: (cardId: string) => void;
  className?: string;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectCard,
  className,
}) => {
  const isUser = message.sender === "user";

  // Helper to render text with inline card badges for citations like [C1]
  const renderFormattedText = (text: string) => {
    if (isUser || !message.referencedCards || message.referencedCards.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed text-sm">{text}</p>;
    }

    // Map label -> ReferencedCard
    const cardMap = new Map(message.referencedCards.map((c) => [c.label, c]));

    // Regex matching [C1], [C2], etc.
    const parts = text.split(/(\[C\d+\])/g);

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-sm">
        {parts.map((part, idx) => {
          const card = cardMap.get(part);
          if (card) {
            return (
              <InlineCardBadge
                key={idx}
                label={card.label}
                cardId={card.card_id}
                title={card.title}
                onSelectCard={onSelectCard}
              />
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  if (isUser) {
    return (
      <div className={cn("flex justify-end gap-2 mb-4", className)}>
        <div className="max-w-[85%] sm:max-w-[78%]">
          <div className="bg-primary-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs text-sm">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
          <span className="block text-[10px] text-neutral-400 text-right mt-1 px-1">
            {message.timestamp}
          </span>
        </div>
        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-2.5 mb-4", className)}>
      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="max-w-[90%] sm:max-w-[85%] flex-1">
        <div className="bg-white border border-neutral-200/90 rounded-2xl rounded-tl-xs p-3.5 shadow-xs">
          {/* Insufficient evidence banner */}
          {message.status === "insufficient_evidence" && (
            <div className="flex items-start gap-2 p-2.5 mb-2.5 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-800 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Chưa đủ dữ kiện để khẳng định:</span> Dữ liệu trong
                bảng hiện tại có thể chưa đủ chi tiết cho câu hỏi này.
              </div>
            </div>
          )}

          {/* Error banner */}
          {message.status === "error" && (
            <div className="flex items-start gap-2 p-2.5 mb-2.5 bg-red-50 border border-red-200/80 rounded-lg text-red-700 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Lỗi xử lý:</span> Không thể hoàn thành phân tích.
                Vui lòng thử lại.
              </div>
            </div>
          )}

          {/* Message content */}
          <div className="text-neutral-800">{renderFormattedText(message.text)}</div>

          {/* Referenced Cards Block */}
          {message.referencedCards && message.referencedCards.length > 0 && (
            <ReferencedCardsBlock cards={message.referencedCards} onSelectCard={onSelectCard} />
          )}

          {/* Citations Block */}
          {message.citations && message.citations.length > 0 && (
            <CitationsBlock citations={message.citations} />
          )}
        </div>

        <span className="block text-[10px] text-neutral-400 mt-1 px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
