import * as React from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DragCancelEvent,
  type ClientRect,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { calculateMidpointPosition } from "@/utils";
import type { KanbanList, KanbanCard, MoveCardInput } from "@/types";

export const LIST_DROP_TARGET_PREFIX = "list-drop:";

export function getListDropTargetId(listId: string): string {
  return `${LIST_DROP_TARGET_PREFIX}${listId}`;
}

function getTargetListId(lists: KanbanList[], overId: string): string | undefined {
  if (overId.startsWith(LIST_DROP_TARGET_PREFIX)) {
    const listId = overId.slice(LIST_DROP_TARGET_PREFIX.length);
    return lists.some((list) => list.id === listId) ? listId : undefined;
  }

  return lists.find((list) => list.cards.some((card) => card.id === overId))?.id;
}

function getInsertionIndex(
  destinationCards: KanbanCard[],
  activeId: string,
  overId: string,
  sourceListId: string,
  destinationListId: string,
  sourceCards: KanbanCard[],
  activeRect: ClientRect | null,
  overRect: ClientRect | null
): number {
  if (overId.startsWith(LIST_DROP_TARGET_PREFIX)) return destinationCards.length;

  const overIndex = destinationCards.findIndex((card) => card.id === overId);
  if (overIndex < 0) return destinationCards.length;

  if (activeRect && overRect) {
    const activeCenterY = activeRect.top + activeRect.height / 2;
    const overCenterY = overRect.top + overRect.height / 2;
    return overIndex + Number(activeCenterY > overCenterY);
  }

  if (sourceListId === destinationListId) {
    const sourceIndex = sourceCards.findIndex((card) => card.id === activeId);
    const overSourceIndex = sourceCards.findIndex((card) => card.id === overId);
    return overIndex + Number(sourceIndex < overSourceIndex);
  }

  return overIndex;
}

function moveCardInPreview(
  lists: KanbanList[],
  activeId: string,
  overId: string,
  activeCard: KanbanCard,
  activeRect: ClientRect | null = null,
  overRect: ClientRect | null = null
): KanbanList[] {
  const sourceList = lists.find((list) => list.cards.some((card) => card.id === activeId));
  const destinationListId = getTargetListId(lists, overId);
  const destinationList = lists.find((list) => list.id === destinationListId);

  if (!sourceList || !destinationList || overId === activeId) return lists;

  const sourceCards = sourceList.cards;
  const destinationCards =
    sourceList.id === destinationList.id
      ? sourceCards.filter((card) => card.id !== activeId)
      : destinationList.cards;
  const insertionIndex = getInsertionIndex(
    destinationCards,
    activeId,
    overId,
    sourceList.id,
    destinationList.id,
    sourceCards,
    activeRect,
    overRect
  );
  const movedCard = { ...activeCard, listId: destinationList.id };
  const nextDestinationCards = [...destinationCards];
  nextDestinationCards.splice(insertionIndex, 0, movedCard);

  return lists.map((list) => {
    if (list.id === sourceList.id && list.id === destinationList.id) {
      return { ...list, cards: nextDestinationCards };
    }
    if (list.id === sourceList.id) {
      return { ...list, cards: sourceCards.filter((card) => card.id !== activeId) };
    }
    if (list.id === destinationList.id) {
      return { ...list, cards: nextDestinationCards };
    }
    return list;
  });
}

function getRect(rect: { current: { translated: ClientRect | null } }): ClientRect | null {
  return rect.current.translated;
}

export interface UseKanbanDndProps {
  lists: KanbanList[];
  onCommitMoveCard: (cardId: string, payload: MoveCardInput) => Promise<void> | void;
}

export function useKanbanDnd({ lists, onCommitMoveCard }: UseKanbanDndProps) {
  const [activeCard, setActiveCard] = React.useState<KanbanCard | null>(null);
  const [previewLists, setPreviewLists] = React.useState<KanbanList[]>(lists);

  React.useEffect(() => {
    setPreviewLists(lists);
  }, [lists]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 7 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = String(event.active.id);
    const card = lists.flatMap((list) => list.cards).find((item) => item.id === cardId);
    setActiveCard(card ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeCard) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeRect = getRect(active.rect);

    setPreviewLists((currentLists) =>
      moveCardInPreview(currentLists, activeId, overId, activeCard, activeRect, over.rect)
    );
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
    const finalLists = moveCardInPreview(
      previewLists,
      activeId,
      overId,
      currentActiveCard,
      getRect(active.rect),
      over.rect
    );
    const targetListId = getTargetListId(finalLists, overId);
    const targetList = finalLists.find((list) => list.id === targetListId);
    const sourceList = lists.find((list) => list.cards.some((card) => card.id === activeId));

    if (!targetList) {
      setPreviewLists(lists);
      return;
    }

    const finalIndex = targetList.cards.findIndex((card) => card.id === activeId);
    if (sourceList?.id === targetList.id) {
      const originalIndex = sourceList.cards.findIndex((card) => card.id === activeId);
      if (finalIndex === originalIndex) {
        setPreviewLists(lists);
        return;
      }
    }

    const targetCardsExcludingActive = targetList.cards.filter((card) => card.id !== activeId);
    const position = calculateMidpointPosition(
      targetCardsExcludingActive,
      finalIndex >= 0 ? finalIndex : targetCardsExcludingActive.length
    );

    await onCommitMoveCard(activeId, {
      targetListId: targetList.id,
      position,
      updatedAt: currentActiveCard.updatedAt,
    });
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    setActiveCard(null);
    setPreviewLists(lists);
  };

  return {
    sensors,
    activeCard,
    previewLists,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
