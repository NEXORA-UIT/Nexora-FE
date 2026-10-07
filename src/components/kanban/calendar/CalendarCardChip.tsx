import * as React from "react";
import type { KanbanCard, CardPriority } from "@/types";

export interface CalendarCardChipProps {
  card: KanbanCard;
  onClick: (card: KanbanCard) => void;
  compact?: boolean;
}

const PRIORITY_BADGE_STYLES: Record<CardPriority, string> = {
  LOW: "text-neutral-400",
  MEDIUM: "text-primary-600",
  HIGH: "text-amber-600",
  URGENT: "text-error-600 font-bold",
};

export const CalendarCardChip: React.FC<CalendarCardChipProps> = ({
  card,
  onClick,
  compact = false,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick(card)}
      className="group flex w-full items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-left text-xs shadow-2xs transition-all hover:border-neutral-300 hover:bg-neutral-50/80 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 active:bg-neutral-100 cursor-pointer"
      aria-label={`${card.code} - ${card.title} - Priority: ${card.priority}`}
    >
      {/* Status Dot */}
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          card.isBlocked
            ? "bg-error-500"
            : card.listId.includes("done")
            ? "bg-emerald-500"
            : card.listId.includes("progress")
            ? "bg-primary-500"
            : "bg-neutral-400"
        }`}
        aria-hidden="true"
      />

      {/* Code */}
      <span className="shrink-0 font-mono text-[10px] font-semibold text-neutral-500">
        {card.code}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">
        {card.title}
      </span>

      {/* Priority Indicator */}
      {!compact && (
        <span
          className={`shrink-0 text-[10px] ${PRIORITY_BADGE_STYLES[card.priority]}`}
          title={`Priority: ${card.priority}`}
        >
          {card.priority === "URGENT" ? "!" : card.priority.charAt(0)}
        </span>
      )}
    </button>
  );
};
