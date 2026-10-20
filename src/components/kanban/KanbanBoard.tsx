import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { AddColumnInline } from "./AddColumnInline";
import { useKanbanDnd } from "@/hooks/useKanbanDnd";
import { LIST_DROP_TARGET_PREFIX } from "@/hooks/useKanbanDnd";
import type {
  KanbanList,
  KanbanCard as KanbanCardType,
  ListCategory,
  MoveCardInput,
} from "@/types";
import { BOARD_BACKGROUNDS, DEFAULT_BOARD_BACKGROUND, type BoardBackgroundPreset } from "./board-background";

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const cardCollisions = pointerCollisions.filter(
    (collision) => !String(collision.id).startsWith(LIST_DROP_TARGET_PREFIX)
  );

  if (cardCollisions.length > 0) return cardCollisions;
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCorners(args);
};

export interface KanbanBoardProps {
  lists: KanbanList[];
  onCommitMoveCard: (cardId: string, payload: MoveCardInput) => Promise<void> | void;
  onAddCard: (listId: string, title: string) => Promise<void> | void;
  onAddColumn: (name: string, category: ListCategory) => Promise<void> | void;
  onCardClick?: (card: KanbanCardType) => void;
  onColumnOptionsClick?: (list: KanbanList) => void;
  backgroundPreset?: BoardBackgroundPreset;
}

const SortableCardItem: React.FC<{
  card: KanbanCardType;
  onClick?: (card: KanbanCardType) => void;
}> = ({ card, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

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
  backgroundPreset = DEFAULT_BOARD_BACKGROUND,
}) => {
  const [addingCardListId, setAddingCardListId] = React.useState<string | null>(null);

  // Canvas horizontal panning state & refs
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = React.useState(false);
  const isMouseDownRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

  const {
    sensors,
    activeCard,
    previewLists,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnd({
    lists,
    onCommitMoveCard,
  });

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary left button
    if (e.button !== 0) return;

    // Do not initiate canvas panning if a card is actively dragged by dnd-kit
    if (activeCard) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Filter out interactive elements, column containers, buttons, and cards
    const interactive = target.closest(
      'button, input, textarea, select, a, [role="button"], form, [data-no-pan="true"]'
    );
    if (interactive) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    isMouseDownRef.current = true;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;

    try {
      container.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is unsupported or already set
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const x = e.pageX - container.offsetLeft;
    const distance = x - startXRef.current;

    if (Math.abs(distance) > 3) {
      if (!isPanning) {
        setIsPanning(true);
      }
      container.scrollLeft = scrollLeftRef.current - distance;
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsPanning(false);

    const container = scrollContainerRef.current;
    if (container) {
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={scrollContainerRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        className={`scrollbar-thin flex min-h-[calc(100vh-230px)] items-start gap-5 overflow-x-auto rounded-3xl border border-white/70 p-4 pb-6 pr-10 shadow-inner ${
          isPanning ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
        style={{
          ...BOARD_BACKGROUNDS[backgroundPreset].style,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
        role="region"
        aria-label="Board canvas"
      >
        {previewLists.map((list) => (
          <KanbanColumn
            key={list.id}
            list={list}
            isAddingCard={addingCardListId === list.id}
            onSetAddingCard={(isAdding) => setAddingCardListId(isAdding ? list.id : null)}
            onAddCard={(title) => onAddCard(list.id, title)}
            onColumnOptionsClick={onColumnOptionsClick}
          >
            <SortableContext
              items={list.cards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {list.cards.map((card) => (
                <SortableCardItem key={card.id} card={card} onClick={onCardClick} />
              ))}
            </SortableContext>
          </KanbanColumn>
        ))}

        {/* Far Right: Add Column Button */}
        <AddColumnInline onAdd={onAddColumn} />

        {/* Rightmost padding spacer to guarantee full visibility without clipping */}
        <div className="pointer-events-none w-8 shrink-0" aria-hidden="true" />
      </div>

      {/* Floating Drag Overlay */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeCard ? <KanbanCard card={activeCard} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};
