import * as React from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { calculateMidpointPosition } from "@/utils";
import type { KanbanList, KanbanCard, MoveCardInput } from "@/types";

export interface UseKanbanDndProps {
  lists: KanbanList[];
  onCommitMoveCard: (cardId: string, payload: MoveCardInput) => Promise<void> | void;
}

export function useKanbanDnd({ lists, onCommitMoveCard }: UseKanbanDndProps) {
  // Local preview state for responsive visual slot opening during drag
  const [activeCard, setActiveCard] = React.useState<KanbanCard | null>(null);
  const [previewLists, setPreviewLists] = React.useState<KanbanList[]>(lists);

  // Sync previewLists when persistent lists change from outside
  React.useEffect(() => {
    setPreviewLists(lists);
  }, [lists]);

  // Pointer sensor with 5px distance constraint to avoid triggering drag on card click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = String(event.active.id);
    for (const list of lists) {
      const found = list.cards.find((c) => c.id === cardId);
      if (found) {
        setActiveCard(found);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeCard) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find source list
    const sourceList = previewLists.find((l) =>
      l.cards.some((c) => c.id === activeId)
    );
    if (!sourceList) return;

    // Destination could be a column container ID or another card ID
    let destList = previewLists.find((l) => l.id === overId);
    if (!destList) {
      destList = previewLists.find((l) =>
        l.cards.some((c) => c.id === overId)
      );
    }
    if (!destList) return;

    // If dragging across different columns, update local visual preview only
    if (sourceList.id !== destList.id) {
      setPreviewLists((prev) => {
        const next = prev.map((list) => {
          if (list.id === sourceList.id) {
            return {
              ...list,
              cards: list.cards.filter((c) => c.id !== activeId),
            };
          }
          if (list.id === destList.id) {
            const overCardIndex = list.cards.findIndex((c) => c.id === overId);
            const insertIndex = overCardIndex >= 0 ? overCardIndex : list.cards.length;
            const updatedCard = { ...activeCard, listId: destList.id };
            const newCards = [...list.cards];
            newCards.splice(insertIndex, 0, updatedCard);
            return {
              ...list,
              cards: newCards,
            };
          }
          return list;
        });
        return next;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const currentActiveCard = activeCard;
    setActiveCard(null);

    if (!over || !currentActiveCard) {
      setPreviewLists(lists);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Identify final destination list from previewLists
    let targetList = previewLists.find((l) => l.id === overId);
    if (!targetList) {
      targetList = previewLists.find((l) =>
        l.cards.some((c) => c.id === overId)
      );
    }
    if (!targetList) {
      setPreviewLists(lists);
      return;
    }

    const finalIndex = targetList.cards.findIndex((c) => c.id === activeId);
    const targetCardsExcludingActive = targetList.cards.filter(
      (c) => c.id !== activeId
    );
    const newPosition = calculateMidpointPosition(
      targetCardsExcludingActive,
      finalIndex >= 0 ? finalIndex : targetCardsExcludingActive.length
    );

    // Commit move via API with OpenAPI MoveCardRequest payload
    await onCommitMoveCard(activeId, {
      targetListId: targetList.id,
      position: newPosition,
      updatedAt: currentActiveCard.updatedAt,
    });
  };

  return {
    sensors,
    activeCard,
    previewLists,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
