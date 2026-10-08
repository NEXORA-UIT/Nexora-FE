import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
      className={`flex flex-col min-h-[110px] sm:min-h-[125px] p-2 transition-colors border-b border-r border-neutral-200/70 ${
        day.isCurrentMonth ? "bg-white" : "bg-neutral-50/60 text-neutral-400"
      } ${day.isToday ? "bg-primary-50/20" : ""}`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between mb-1.5">
        {day.isToday ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 font-semibold text-xs text-white shadow-2xs">
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
          <span className="text-[10px] font-medium text-neutral-400" aria-label={`${day.cards.length} cards`}>
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
              className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold text-primary-600 hover:bg-primary-50 hover:text-primary-700 focus:outline-hidden focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              +{overflowCount} more
            </button>

            {/* Overflow Cards Dialog */}
            <Dialog.Root open={isOverflowOpen} onOpenChange={setIsOverflowOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-2xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white p-5 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus:outline-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <Dialog.Title className="text-sm font-semibold text-neutral-900">
                      {format(day.date, "EEEE, MMMM d, yyyy")}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
                    {day.cards.map((card) => (
                      <CalendarCardChip
                        key={card.id}
                        card={card}
                        onClick={handleCardSelect}
                      />
                    ))}
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        )}
      </div>
    </div>
  );
};
