import * as React from "react";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { format } from "date-fns";
import { CalendarCardChip } from "./CalendarCardChip";
import type { CalendarDay } from "./calendar.utils";
import type { KanbanCard } from "@/types";

export interface CalendarDayCellProps {
  day: CalendarDay;
  onCardClick: (card: KanbanCard) => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({ day, onCardClick }) => {
  const [isOverflowOpen, setIsOverflowOpen] = React.useState(false);

  const visibleCards = day.cards.slice(0, 2);
  const overflowCount = Math.max(0, day.cards.length - 2);

  const handleCardSelect = (card: KanbanCard) => {
    setIsOverflowOpen(false);
    onCardClick(card);
  };

  return (
    <div
      className={`flex min-h-[110px] flex-col border-b border-r border-neutral-200/70 p-2 transition-colors sm:min-h-[125px] ${
        day.isCurrentMonth ? "bg-white" : "bg-neutral-50/60 text-neutral-400"
      } ${day.isToday ? "bg-primary-50/20" : ""}`}
    >
      {/* Day Header */}
      <div className="mb-1.5 flex items-center justify-between">
        {day.isToday ? (
          <span className="shadow-2xs flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
            {day.dayOfMonth}
          </span>
        ) : (
          <span
            className={`text-xs font-semibold ${
              day.isCurrentMonth ? "text-neutral-700" : "text-neutral-400"
            }`}
          >
            {day.dayOfMonth}
          </span>
        )}

        {/* Small card counter badge if $>0$ */}
        {day.cards.length > 0 && (
          <span
            className="text-[10px] font-medium text-neutral-400"
            aria-label={`${day.cards.length} cards`}
          >
            {day.cards.length}
          </span>
        )}
      </div>

      {/* Cards List */}
      <div className="flex-1 space-y-1 overflow-hidden">
        {visibleCards.map((card) => (
          <CalendarCardChip key={card.id} card={card} onClick={handleCardSelect} />
        ))}

        {/* +N More Overflow Button */}
        {overflowCount > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setIsOverflowOpen(true)}
              className="text-primary-600 hover:text-primary-700 focus:outline-hidden inline-flex cursor-pointer items-center rounded px-1.5 py-0.5 text-[11px] font-semibold hover:bg-primary-50 focus:ring-1 focus:ring-primary-500"
            >
              +{overflowCount} more
            </button>

            {/* Overflow Cards Dialog */}
            <DialogRoot open={isOverflowOpen} onOpenChange={setIsOverflowOpen}>
              <DialogContent size="sm">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold text-neutral-900">
                    {format(day.date, "EEEE, MMMM d, yyyy")}
                  </DialogTitle>
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DialogClose>
                </DialogHeader>

                <DialogBody className="max-h-[65dvh] space-y-1.5">
                  {day.cards.map((card) => (
                    <CalendarCardChip key={card.id} card={card} onClick={handleCardSelect} />
                  ))}
                </DialogBody>
              </DialogContent>
            </DialogRoot>
          </div>
        )}
      </div>
    </div>
  );
};
