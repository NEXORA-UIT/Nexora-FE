import * as React from "react";
import { Calendar, CheckCircle2, Lock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { CardPriorityBadge } from "./CardPriorityBadge";
import { CardTagBadge } from "./CardTagBadge";
import type { KanbanCard as KanbanCardType } from "@/types";

export interface KanbanCardProps {
  card: KanbanCardType;
  onClick?: (card: KanbanCardType) => void;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  onClick,
  isDragging,
}) => {
  const primaryTag = card.labels[0]?.name;
  const primaryAssignee = card.assignees[0];

  const formattedDueDate = React.useMemo(() => {
    if (!card.dueDate) return null;
    try {
      return format(parseISO(card.dueDate), "MMM dd");
    } catch {
      return null;
    }
  }, [card.dueDate]);

  const hasChecklist = card.tasksCount > 0;
  const isChecklistComplete =
    hasChecklist && card.completedTasksCount === card.tasksCount;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(card)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(card);
        }
      }}
      className={`group relative flex flex-col justify-between rounded-xl border bg-white p-3.5 shadow-2xs transition-all cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 ${
        isDragging
          ? "opacity-40 border-primary-400 shadow-md"
          : "border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs"
      }`}
    >
      <div className="space-y-2">
        {/* Top Tag & Priority Row */}
        <div className="flex items-center justify-between gap-2">
          {primaryTag ? (
            <CardTagBadge label={primaryTag} />
          ) : (
            <span className="text-[11px] font-mono text-neutral-400">
              {card.code}
            </span>
          )}
          <CardPriorityBadge priority={card.priority} />
        </div>

        {/* Warning Banner if blocked by prerequisite */}
        {card.isBlocked && (
          <div className="flex items-center gap-1.5 rounded-lg border border-error-100 bg-error-50 px-2 py-1 text-[11px] font-medium text-error-700">
            <Lock className="h-3 w-3 shrink-0 text-error-600" />
            <span className="truncate">
              {card.blockReason || "Blocked by Prerequisite"}
            </span>
          </div>
        )}

        {/* Issue Code & Title */}
        <div>
          {primaryTag && (
            <span className="block text-[11px] font-mono font-medium text-neutral-400 uppercase tracking-wider mb-0.5">
              {card.code}
            </span>
          )}
          <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors leading-snug line-clamp-2">
            {card.title}
          </h4>
        </div>
      </div>

      {/* Bottom Metadata: Due Date, Checklist, Assignee */}
      <div className="mt-3.5 flex items-center justify-between gap-2 pt-1 text-xs text-neutral-500">
        {/* Left: Date & Checklist counter */}
        <div className="flex items-center gap-2.5">
          {formattedDueDate && (
            <div
              title={`Due ${formattedDueDate}`}
              className="flex items-center gap-1 text-[11px] font-medium text-neutral-500"
            >
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              <span>{formattedDueDate}</span>
            </div>
          )}

          {hasChecklist && (
            <div
              title={`Tasks: ${card.completedTasksCount}/${card.tasksCount}`}
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isChecklistComplete ? "text-primary-700" : "text-neutral-500"
              }`}
            >
              <CheckCircle2
                className={`h-3.5 w-3.5 ${
                  isChecklistComplete ? "text-primary-600" : "text-neutral-400"
                }`}
              />
              <span>
                {card.completedTasksCount}/{card.tasksCount}
              </span>
            </div>
          )}
        </div>

        {/* Right: Assignee Avatar */}
        {primaryAssignee && (
          <div
            title={primaryAssignee.name}
            className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-2xs shrink-0"
          >
            {primaryAssignee.initials}
          </div>
        )}
      </div>
    </div>
  );
};
