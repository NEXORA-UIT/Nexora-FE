import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { formatPeriodTitle } from "./calendar.utils";

export interface CalendarToolbarProps {
  currentDate: Date;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
  unscheduledCount: number;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentDate,
  onPrevPeriod,
  onNextPeriod,
  onToday,
  unscheduledCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
      {/* Left: Month / Year Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-neutral-900 tracking-tight">
          {formatPeriodTitle(currentDate)}
        </h2>

        {/* Lightweight Unscheduled Count Badge */}
        {unscheduledCount > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100/90 px-2 py-0.5 text-xs font-medium text-neutral-600"
            title={`${unscheduledCount} card(s) have no start or due date`}
          >
            <CalendarIcon className="h-3 w-3 text-neutral-400" />
            <span>{unscheduledCount} unscheduled</span>
          </span>
        )}
      </div>

      {/* Right: Period Navigation Controls */}
      <div className="flex items-center gap-1.5 self-start sm:self-auto">
        <button
          type="button"
          onClick={onPrevPeriod}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 active:bg-neutral-100 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToday}
          aria-label="Jump to current date"
          className="h-8 rounded-lg border border-neutral-200/80 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 active:bg-neutral-100 cursor-pointer"
        >
          Today
        </button>

        <button
          type="button"
          onClick={onNextPeriod}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 active:bg-neutral-100 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
