import * as React from "react";
import { toast } from "sonner";
import { cardApi, listApi } from "@/apis";
import { canMoveCardToDone } from "@/utils";
import type {
  BoardDetail,
  KanbanCard,
  ListCategory,
  MoveCardInput,
  UpdateCardInput,
  CardActivity,
  PaginatedActivitiesResult,
} from "@/types";

export interface UseBoardCardMutationsOptions {
  boardId?: string;
  board: BoardDetail | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
  reloadBoard: () => Promise<void>;
  selectedCardId: string | null;
  setSelectedCardId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useBoardCardMutations({
  boardId,
  board,
  setBoard,
  reloadBoard,
  selectedCardId,
  setSelectedCardId,
}: UseBoardCardMutationsOptions) {
  // Action: Add Card
  const handleAddCard = React.useCallback(async (listId: string, title: string) => {
    try {
      const newCard = await cardApi.createCard(listId, { title });
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  cards: [
                    ...list.cards,
                    {
                      ...newCard,
                      statusGroup: newCard.statusGroup ?? list.category,
                    },
                  ],
                }
              : list
          ),
        };
      });
      toast.success(`Card "${newCard.code}" created.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create card");
    }
  }, [setBoard]);

  // Action: Add Column / List
  const handleAddColumn = React.useCallback(async (name: string, category: ListCategory) => {
    if (!boardId) return;
    try {
      const newList = await listApi.createList(boardId, { name, category });
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: [...prev.lists, newList],
        };
      });
      toast.success(`List "${newList.name}" added.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add list");
    }
  }, [boardId, setBoard]);

  // Action: Commit card move after drag end
  const handleCommitMoveCard = React.useCallback(async (cardId: string, payload: MoveCardInput) => {
    if (!board) return;

    const currentCard = board.lists
      .flatMap((l) => l.cards)
      .find((c) => c.id === cardId);

    const targetList = board.lists.find((l) => l.id === payload.targetListId);

    // Enforce business rule: Blocked card cannot be moved to DONE (UC-PLAN-11)
    if (currentCard && targetList) {
      const check = canMoveCardToDone(currentCard, targetList.category);
      if (!check.allowed) {
        toast.error(check.reason);
        // Force state update to reset optimistic DnD preview lists
        setBoard((prev) => (prev ? { ...prev, lists: [...prev.lists] } : prev));
        return;
      }
    }

    try {
      const serverMovedCard = await cardApi.moveCard(cardId, payload);
      // Synchronize persistent board state using the server response
      setBoard((prev) => {
        if (!prev) return prev;

        const foundCard = prev.lists
          .flatMap((l) => l.cards)
          .find((c) => c.id === cardId);

        if (!foundCard) return prev;

        const movedCard: KanbanCard = {
          ...foundCard,
          ...serverMovedCard,
          listId: payload.targetListId,
          position: payload.position,
          statusGroup: targetList?.category ?? serverMovedCard.statusGroup ?? foundCard.statusGroup,
          updatedAt: serverMovedCard.updatedAt,
        };

        const updatedLists = prev.lists.map((list) => {
          if (list.id === payload.targetListId) {
            const cardsWithout = list.cards.filter((c) => c.id !== cardId);
            const newCards = [...cardsWithout, movedCard].sort(
              (a, b) => a.position - b.position
            );
            return { ...list, cards: newCards };
          }
          return {
            ...list,
            cards: list.cards.filter((c) => c.id !== cardId),
          };
        });

        return {
          ...prev,
          lists: updatedLists,
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move card");
      void reloadBoard(); // Revert on failure
    }
  }, [board, reloadBoard, setBoard]);

  // Action: Status Change (moves card across Kanban lists via moveCard)
  const handleStatusChange = React.useCallback(async (card: KanbanCard, targetCategory: ListCategory): Promise<boolean> => {
    if (!board) return false;

    const targetList = board.lists.find((l) => l.category === targetCategory);
    if (!targetList) {
      toast.error(`Target list for category ${targetCategory} not found`);
      return false;
    }

    if (card.listId === targetList.id) return true;

    // Prerequisite validation: if moving to DONE and card is blocked, reject transition
    const check = canMoveCardToDone(card, targetCategory);
    if (!check.allowed) {
      toast.error(check.reason);
      return false;
    }

    const maxPos = targetList.cards.reduce((max, c) => Math.max(max, c.position), 0);
    const position = maxPos + 1024;

    await handleCommitMoveCard(card.id, {
      targetListId: targetList.id,
      position,
      updatedAt: card.updatedAt,
    });
    return true;
  }, [board, handleCommitMoveCard]);

  // Action: Update Card fields with OCC
  const handleUpdateCard = React.useCallback(async (cardId: string, payload: UpdateCardInput): Promise<void> => {
    try {
      const updatedCard = await cardApi.updateCard(cardId, payload);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    ...updatedCard,
                    statusGroup: updatedCard.statusGroup ?? c.statusGroup ?? list.category,
                  }
                : c
            ),
          })),
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update card";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "CARD_CONFLICT" || status === 409 || msg.includes("CARD_CONFLICT") || msg.includes("409")) {
        toast.error("Card was modified by another session. Refreshing...");
        void reloadBoard();
      } else {
        toast.error(msg);
      }
      throw err;
    }
  }, [reloadBoard, setBoard]);

  // Action: Delete Card
  const handleDeleteCard = React.useCallback(async (cardId: string): Promise<void> => {
    try {
      await cardApi.deleteCard(cardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.filter((c) => c.id !== cardId),
          })),
        };
      });
      if (selectedCardId === cardId) {
        setSelectedCardId(null);
      }
      toast.success("Card deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete card");
    }
  }, [selectedCardId, setBoard, setSelectedCardId]);

  // Action: Fetch Card Activities (Lazy with cursor pagination support)
  const fetchCardActivities = React.useCallback(async (
    cardId: string,
    cursor?: string
  ): Promise<CardActivity[] | PaginatedActivitiesResult> => {
    return cardApi.getCardActivities(cardId, { cursor, limit: 20 }, board?.members);
  }, [board?.members]);

  return {
    handleAddCard,
    handleAddColumn,
    handleCommitMoveCard,
    handleStatusChange,
    handleUpdateCard,
    handleDeleteCard,
    fetchCardActivities,
  };
}
