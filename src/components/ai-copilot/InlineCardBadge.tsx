import React from "react";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InlineCardBadgeProps {
  label: string;
  cardId: string;
  title?: string;
  onSelectCard?: (cardId: string) => void;
  className?: string;
}

export const InlineCardBadge: React.FC<InlineCardBadgeProps> = ({
  label,
  cardId,
  title,
  onSelectCard,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelectCard?.(cardId)}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 mx-1 my-0.5 text-xs font-medium rounded-md",
        "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200/80 transition-colors cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary-500/20",
        className
      )}
      title={title || `Mở chi tiết thẻ ${label}`}
      aria-label={`${label} ${title || ""}`.trim()}
    >
      <CheckSquare className="w-3 h-3 text-primary-500 shrink-0" />
      <span className="font-semibold text-primary-800">{label}</span>
      {title && <span className="max-w-[140px] truncate">{title}</span>}
    </button>
  );
};
