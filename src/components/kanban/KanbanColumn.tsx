import * as React from "react";
import { GripVertical, Plus, MoreHorizontal } from "lucide-react";
import { AddCardInline } from "./AddCardInline";
import type { KanbanList } from "@/types";

export interface KanbanColumnProps {
  list: KanbanList;
  children: React.ReactNode;
  onAddCard: (title: string) => Promise<void> | void;
  onColumnOptionsClick?: (list: KanbanList) => void;
  isAddingCard: boolean;
  onSetAddingCard: (isAdding: boolean) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  list,
  children,
  onAddCard,
  onColumnOptionsClick,
  isAddingCard,
  onSetAddingCard,
}) => {
  return (
    <div className="flex h-full w-[320px] min-w-[320px] max-w-[320px] shrink-0 flex-col rounded-2xl border border-neutral-200/90 bg-neutral-50/80 p-3.5 select-none max-h-[calc(100vh-230px)] shadow-2xs">
      {/* 1. Column Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-200/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="h-4 w-4 text-neutral-400 shrink-0 cursor-grab" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 truncate">
            {list.name}
          </h3>
          <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-neutral-200/70 px-1.5 text-[11px] font-semibold text-neutral-700">
            {list.cards.length}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onSetAddingCard(true)}
            className="flex h-6.5 w-6.5 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800 transition-colors"
            title="Add card"
            aria-label="Add card"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onColumnOptionsClick?.(list)}
            className="flex h-6.5 w-6.5 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800 transition-colors"
            title="Column options"
            aria-label="Column options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Cards Container */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-0.5 scrollbar-thin">
        {list.cards.length === 0 && !isAddingCard ? (
          <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-xs text-neutral-400 font-medium">
            No cards in this list
          </div>
        ) : (
          children
        )}
      </div>

      {/* 3. Column Footer: Inline Card Creator or Add Button */}
      <div className="pt-2 border-t border-neutral-200/60 shrink-0">
        {isAddingCard ? (
          <AddCardInline
            onAdd={onAddCard}
            onCancel={() => onSetAddingCard(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => onSetAddingCard(true)}
            className="flex w-full items-center gap-1.5 rounded-xl py-1.5 px-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add card</span>
          </button>
        )}
      </div>
    </div>
  );
};
