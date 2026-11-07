import * as React from "react";
import { cn } from "@/lib/utils";
import type { KanbanList } from "@/types";

export interface MobileColumnSelectorProps {
  lists: KanbanList[];
  activeListId?: string | null;
  onSelect: (listId: string) => void;
}

export const MobileColumnSelector: React.FC<MobileColumnSelectorProps> = ({
  lists,
  activeListId,
  onSelect,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Kanban columns"
      className="scrollbar-none flex items-center gap-1.5 overflow-x-auto py-2 select-none sm:hidden"
    >
      {lists.map((list) => {
        const isSelected = list.id === activeListId;
        return (
          <button
            key={list.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(list.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs transition-all duration-150 border",
              isSelected
                ? "bg-primary-600 text-white font-bold border-primary-600 shadow-xs"
                : "bg-white text-neutral-600 hover:text-neutral-900 border-neutral-200 shadow-2xs"
            )}
          >
            <span className="truncate">{list.name}</span>
            <span
              className={cn(
                "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-neutral-100 text-neutral-600"
              )}
            >
              {list.cards.length}
            </span>
          </button>
        );
      })}
    </div>
  );
};
