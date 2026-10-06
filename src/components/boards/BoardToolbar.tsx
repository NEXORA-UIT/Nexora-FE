import * as React from "react";
import { Search, ListFilter, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { BoardToolbarProps, BoardFilterTab, BoardSortOption } from "@/types";

const SORT_LABELS: Record<BoardSortOption, string> = {
  recently_updated: "Recently updated",
  name_asc: "Name (A-Z)",
  progress_desc: "Progress (High to Low)",
  tasks_desc: "Open tasks (Most)",
};

export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  counts,
}) => {
  const filterTabs: Array<{ id: BoardFilterTab; label: string; count: number }> = [
    { id: "all", label: "All Boards", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "archived", label: "Archived", count: counts.archived },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search boards..."
          className="h-9 w-full rounded-xl border border-neutral-200/90 bg-neutral-50/60 pl-9 pr-8 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-500/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Right: Filters & Sort Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Filter Segmented Pills */}
        <div className="flex items-center rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-1 select-none">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs transition-colors",
                  isSelected
                    ? "bg-white font-semibold text-primary-700 shadow-2xs border border-neutral-200/60"
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "ml-1.5 text-[10px]",
                    isSelected ? "text-primary-600 font-bold" : "text-neutral-400"
                  )}
                >
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200/90 bg-white px-3 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              <ListFilter className="h-3.5 w-3.5 text-neutral-500" />
              <span>{SORT_LABELS[sortBy]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(Object.keys(SORT_LABELS) as BoardSortOption[]).map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => onSortChange(option)}
                className="flex items-center justify-between"
              >
                <span>{SORT_LABELS[option]}</span>
                {sortBy === option && (
                  <Check className="h-3.5 w-3.5 text-primary-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
