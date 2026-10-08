import * as React from "react";
import {
  Columns3,
  Calendar as CalendarIcon,
  CalendarCheck,
  Archive,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BoardDetailToolbarProps {
  activeView: "board" | "calendar" | "planning";
  onViewChange: (view: "board" | "calendar" | "planning") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  archivedListsCount?: number;
  onArchivedListsClick?: () => void;
  onFilterClick?: () => void;
}

export const BoardDetailToolbar: React.FC<BoardDetailToolbarProps> = ({
  activeView,
  onViewChange,
  searchQuery,
  onSearchChange,
  archivedListsCount = 0,
  onArchivedListsClick,
  onFilterClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4 select-none">
      {/* 1. View Switcher Tabs (Board vs Calendar vs Planning) */}
      <div className="flex items-center gap-1 rounded-xl bg-neutral-100/80 p-1 border border-neutral-200/60 self-start">
        <button
          type="button"
          onClick={() => onViewChange("board")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeView === "board"
              ? "bg-white text-neutral-900 shadow-2xs border border-neutral-200/80"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Columns3 className="h-3.5 w-3.5" />
          <span>Board</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange("calendar")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeView === "calendar"
              ? "bg-white text-neutral-900 shadow-2xs border border-neutral-200/80"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange("planning")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeView === "planning"
              ? "bg-white text-neutral-900 shadow-2xs border border-neutral-200/80"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          <span>Planning</span>
        </button>
      </div>

      {/* 2. Utility Actions: Archived Lists, Search, Filter */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        {/* Archived Lists Counter Pill */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onArchivedListsClick}
          className={`h-8 gap-1.5 rounded-lg text-xs font-medium transition-colors ${
            archivedListsCount > 0
              ? "border-neutral-200/90 bg-white text-neutral-600 hover:bg-neutral-50 shadow-2xs"
              : "border-transparent bg-transparent text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/60"
          }`}
        >
          <Archive className={`h-3.5 w-3.5 ${archivedListsCount > 0 ? "text-neutral-500" : "text-neutral-400"}`} />
          <span>Archived lists</span>
          <span
            className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
              archivedListsCount > 0 ? "bg-neutral-100 text-neutral-700" : "bg-neutral-100/60 text-neutral-400"
            }`}
          >
            {archivedListsCount}
          </span>
        </Button>

        {/* Search Cards Input */}
        <div className="relative min-w-[130px] flex-1 sm:w-56 sm:flex-initial">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cards..."
            className="h-8 w-full rounded-lg border border-neutral-200/90 bg-white pl-8 pr-7 text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-primary-500 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFilterClick}
          className="h-8 gap-1.5 rounded-lg border-neutral-200/90 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
          <span>Filter</span>
        </Button>
      </div>
    </div>
  );
};
