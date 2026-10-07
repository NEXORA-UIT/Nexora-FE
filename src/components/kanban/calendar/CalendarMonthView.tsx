import * as React from "react";
import { CalendarDayCell } from "./CalendarDayCell";
import type { CalendarDay } from "./calendar.utils";
import type { KanbanCard } from "@/types";

export interface CalendarMonthViewProps {
  days: CalendarDay[];
  onCardClick: (card: KanbanCard) => void;
}

const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({ days, onCardClick }) => {
  return (
    <div className="flex flex-col rounded-xl border-t border-l border-neutral-200/80 shadow-2xs overflow-hidden select-none bg-white">
      {/* 7-Column Weekday Header */}
      <div className="grid grid-cols-7 bg-neutral-50/90 text-center">
        {WEEKDAY_NAMES.map((weekday) => (
          <div
            key={weekday}
            role="columnheader"
            className="py-2.5 text-[11px] font-semibold text-neutral-500 border-b border-r border-neutral-200/80 uppercase tracking-wider"
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Days Grid (35 or 42 cells) */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <CalendarDayCell key={day.dateString} day={day} onCardClick={onCardClick} />
        ))}
      </div>
    </div>
  );
};
