import * as React from "react";
import { format, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import { CalendarCardChip } from "./CalendarCardChip";
import { getAgendaGroups } from "./calendar.utils";
import type { KanbanCard } from "@/types";

export interface CalendarAgendaViewProps {
  currentDate: Date;
  cards: KanbanCard[];
  onCardClick: (card: KanbanCard) => void;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  currentDate,
  cards,
  onCardClick,
}) => {
  const groups = getAgendaGroups(currentDate, cards);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 p-10 text-center select-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-2.5">
          <CalendarDays className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800">No scheduled work</h3>
        <p className="mt-1 text-xs text-neutral-500 max-w-xs">
          There are no cards with dates in this period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const today = isToday(group.date);
        return (
          <div
            key={group.dateString}
            className="rounded-xl border border-neutral-200/80 bg-white p-3 shadow-2xs space-y-2.5"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold ${
                    today ? "text-primary-600 font-bold" : "text-neutral-800"
                  }`}
                >
                  {format(group.date, "EEEE, MMM d")}
                </span>
                {today && (
                  <span className="rounded-full bg-primary-100 px-2 py-0.2 text-[10px] font-semibold text-primary-700">
                    Today
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-neutral-400">
                {group.cards.length} {group.cards.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-1.5">
              {group.cards.map((card) => (
                <div key={card.id} className="min-h-[40px] flex items-center">
                  <CalendarCardChip card={card} onClick={onCardClick} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
