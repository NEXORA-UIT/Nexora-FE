import * as React from "react";
import { GripVertical, Plus, MoreHorizontal } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { AddCardInline } from "./AddCardInline";
import type { KanbanList } from "@/types";
import { getListDropTargetId } from "@/hooks/useKanbanDnd";

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
  const { isOver, setNodeRef } = useDroppable({ id: getListDropTargetId(list.id) });

  return (
    <div className="shadow-md flex h-full max-h-[calc(100vh-230px)] w-[320px] min-w-[320px] max-w-[320px] shrink-0 select-none flex-col rounded-2xl border border-white/80 bg-white/90 p-3.5 backdrop-blur-sm">
      {/* 1. Column Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200/60 pb-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <GripVertical
            className="pointer-events-none h-4 w-4 shrink-0 select-none text-neutral-300"
            aria-hidden="true"
          />
          <h3 className="truncate text-xs font-bold uppercase tracking-wider text-neutral-800">
            {list.name}
          </h3>
          <span className="h-4.5 min-w-4.5 flex items-center justify-center rounded-full bg-neutral-200/70 px-1.5 text-[11px] font-semibold text-neutral-700">
            {list.cards.length}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onSetAddingCard(true)}
            className="h-6.5 w-6.5 flex items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-800"
            title="Add card"
            aria-label="Add card"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onColumnOptionsClick?.(list)}
            className="h-6.5 w-6.5 flex items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-800"
            title="Column options"
            aria-label="Column options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Cards Container */}
      <div
        ref={setNodeRef}
        className={`scrollbar-thin min-h-28 flex-1 space-y-3 overflow-y-auto rounded-lg py-3 pr-0.5 transition-colors ${
          isOver ? "bg-primary-50/70" : ""
        }`}
      >
        {list.cards.length === 0 && !isAddingCard ? (
          <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center text-xs font-medium text-neutral-400">
            No cards in this list
          </div>
        ) : (
          children
        )}
      </div>

      {/* 3. Column Footer: Inline Card Creator or Add Button */}
      <div className="shrink-0 border-t border-neutral-200/60 pt-2">
        {isAddingCard ? (
          <AddCardInline onAdd={onAddCard} onCancel={() => onSetAddingCard(false)} />
        ) : (
          <button
            type="button"
            onClick={() => onSetAddingCard(true)}
            className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-200/60 hover:text-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add card</span>
          </button>
        )}
      </div>
    </div>
  );
};
