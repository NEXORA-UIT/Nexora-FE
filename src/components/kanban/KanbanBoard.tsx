import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { AddColumnInline } from "./AddColumnInline";
import { useKanbanDnd } from "@/hooks/useKanbanDnd";
import type { KanbanList, KanbanCard as KanbanCardType, ListCategory, MoveCardInput } from "@/types";

export interface KanbanBoardProps {
  lists: KanbanList[];
  onCommitMoveCard: (cardId: string, payload: MoveCardInput) => Promise<void> | void;
  onAddCard: (listId: string, title: string) => Promise<void> | void;
  onAddColumn: (name: string, category: ListCategory) => Promise<void> | void;
  onCardClick?: (card: KanbanCardType) => void;
  onColumnOptionsClick?: (list: KanbanList) => void;
}

const SortableCardItem: React.FC<{
  card: KanbanCardType;
  onClick?: (card: KanbanCardType) => void;
}> = ({ card, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard card={card} onClick={onClick} isDragging={isDragging} />
    </div>
  );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  lists,
  onCommitMoveCard,
  onAddCard,
  onAddColumn,
  onCardClick,
  onColumnOptionsClick,
}) => {
  const [addingCardListId, setAddingCardListId] = React.useState<string | null>(null);

  const {
    sensors,
    activeCard,
    previewLists,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanDnd({
    lists,
    onCommitMoveCard,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-6 items-start scrollbar-thin select-none">
        {previewLists.map((list) => (
          <KanbanColumn
            key={list.id}
            list={list}
            isAddingCard={addingCardListId === list.id}
            onSetAddingCard={(isAdding) =>
              setAddingCardListId(isAdding ? list.id : null)
            }
            onAddCard={(title) => onAddCard(list.id, title)}
            onColumnOptionsClick={onColumnOptionsClick}
          >
            <SortableContext
              items={list.cards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {list.cards.map((card) => (
                <SortableCardItem
                  key={card.id}
                  card={card}
                  onClick={onCardClick}
                />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}

        {/* Far Right: Add Column Button */}
        <AddColumnInline onAdd={onAddColumn} />
      </div>

      {/* Floating Drag Overlay */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeCard ? <KanbanCard card={activeCard} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};
