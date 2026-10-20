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
import type { BoardCardFilters, BoardLabel, BoardMember, CardPriority, ListCategory } from "@/types";

export interface BoardDetailToolbarProps {
  activeView: "board" | "calendar" | "planning";
  onViewChange: (view: "board" | "calendar" | "planning") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  archivedListsCount?: number;
  onArchivedListsClick?: () => void;
  onFilterClick?: () => void;
  filters: BoardCardFilters;
  onFiltersChange: (filters: BoardCardFilters) => void;
  members: BoardMember[];
  labels: BoardLabel[];
}

export const BoardDetailToolbar: React.FC<BoardDetailToolbarProps> = ({
  activeView,
  onViewChange,
  searchQuery,
  onSearchChange,
  archivedListsCount = 0,
  onArchivedListsClick,
  onFilterClick,
  filters,
  onFiltersChange,
  members,
  labels,
}) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const activeFilterCount = Object.values(filters).filter((value) => Array.isArray(value) ? value.length > 0 : value !== "ALL").length;

  const updateFilter = <K extends keyof BoardCardFilters>(key: K, value: BoardCardFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between select-none">
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
        <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={isFilterOpen}
          aria-controls="board-card-filter-panel"
          onClick={() => {
            setIsFilterOpen((open) => !open);
            onFilterClick?.();
          }}
          className="h-8 gap-1.5 rounded-lg border-neutral-200/90 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
          <span>Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}</span>
        </Button>
        {isFilterOpen && (
          <div id="board-card-filter-panel" role="region" className="absolute right-0 top-10 z-30 w-72 space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg" aria-label="Card filters">
            <label className="block space-y-1 text-xs font-medium text-neutral-700">
              <span>Status</span>
              <select aria-label="Filter by status" value={filters.statusGroup} onChange={(event) => updateFilter("statusGroup", event.target.value as ListCategory | "ALL")} className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm">
                <option value="ALL">All statuses</option><option value="TODO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option>
              </select>
            </label>
            <label className="block space-y-1 text-xs font-medium text-neutral-700">
              <span>Priority</span>
              <select aria-label="Filter by priority" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value as CardPriority | "ALL")} className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm">
                <option value="ALL">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
              </select>
            </label>
            <label className="block space-y-1 text-xs font-medium text-neutral-700">
              <span>Assignees</span>
              <select multiple aria-label="Filter by assignee" value={filters.assigneeIds} onChange={(event) => updateFilter("assigneeIds", Array.from(event.target.selectedOptions, (option) => option.value))} className="min-h-20 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm">
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-xs font-medium text-neutral-700">
              <span>Labels</span>
              <select multiple aria-label="Filter by label" value={filters.labelIds} onChange={(event) => updateFilter("labelIds", Array.from(event.target.selectedOptions, (option) => option.value))} className="min-h-20 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm">
                {labels.map((label) => <option key={label.id} value={label.id}>{label.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-xs font-medium text-neutral-700">
              <span>Due date</span>
              <select aria-label="Filter by due date" value={filters.dueDate} onChange={(event) => updateFilter("dueDate", event.target.value as BoardCardFilters["dueDate"])} className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm">
                <option value="ALL">Any date</option><option value="OVERDUE">Overdue</option><option value="SCHEDULED">Scheduled</option><option value="UNSCHEDULED">No due date</option>
              </select>
            </label>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => onFiltersChange({ statusGroup: "ALL", priority: "ALL", assigneeIds: [], dueDate: "ALL", labelIds: [] })}>Clear filters</Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
