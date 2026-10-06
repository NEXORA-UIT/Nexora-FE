import * as React from "react";
import { toast } from "sonner";
import { boardApi, cardApi, listApi } from "@/apis";
import { filterCardsByQuery } from "@/utils";
import type { BoardDetail, KanbanList, ListCategory, MoveCardInput } from "@/types";

export function useBoardDetail(boardId?: string) {
  const [board, setBoard] = React.useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & View tab state
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeView, setActiveView] = React.useState<"board" | "calendar">("board");

  const loadBoard = React.useCallback(async () => {
    if (!boardId) {
      setError("Board ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await boardApi.getBoardDetail(boardId);
      setBoard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  React.useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  // Derived filtered lists based on live search query
  const filteredLists = React.useMemo<KanbanList[]>(() => {
    if (!board) return [];
    if (!searchQuery.trim()) return board.lists;

    return board.lists.map((list) => ({
      ...list,
      cards: filterCardsByQuery(list.cards, searchQuery),
    }));
  }, [board, searchQuery]);

  // Action: Add Card
  const handleAddCard = async (listId: string, title: string) => {
    try {
      const newCard = await cardApi.createCard(listId, { title });
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id === listId
              ? { ...list, cards: [...list.cards, newCard] }
              : list
          ),
        };
      });
      toast.success(`Card "${newCard.code}" created.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create card");
    }
  };

  // Action: Add Column / List
  const handleAddColumn = async (name: string, category: ListCategory) => {
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
  };

  // Action: Commit card move after drag end
  const handleCommitMoveCard = async (cardId: string, payload: MoveCardInput) => {
    try {
      await cardApi.moveCard(cardId, payload);
      // Synchronize persistent board state
      setBoard((prev) => {
        if (!prev) return prev;

        let movedCard = prev.lists
          .flatMap((l) => l.cards)
          .find((c) => c.id === cardId);

        if (!movedCard) return prev;

        movedCard = {
          ...movedCard,
          listId: payload.targetListId,
          position: payload.position,
          updatedAt: new Date().toISOString(),
        };

        const updatedLists = prev.lists.map((list) => {
          if (list.id === payload.targetListId) {
            const cardsWithout = list.cards.filter((c) => c.id !== cardId);
            const newCards = [...cardsWithout, movedCard!].sort(
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
      void loadBoard(); // Revert on failure
    }
  };

  return {
    board,
    filteredLists,
    isLoading,
    error,
    reload: loadBoard,

    // Controls
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,

    // Operations
    handleAddCard,
    handleAddColumn,
    handleCommitMoveCard,
  };
}
