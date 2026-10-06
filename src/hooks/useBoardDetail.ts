import * as React from "react";
import { toast } from "sonner";
import { boardApi, cardApi, listApi } from "@/apis";
import { filterCardsByQuery } from "@/utils";
import type {
  BoardDetail,
  KanbanCard,
  KanbanList,
  ListCategory,
  MoveCardInput,
  UpdateCardInput,
  CardActivity,
} from "@/types";

export function useBoardDetail(boardId?: string) {
  const [board, setBoard] = React.useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & View tab state
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeView, setActiveView] = React.useState<"board" | "calendar">("board");

  // Selected Card for Drawer
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);

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

  // Derived selected card memoized from current board.lists
  const selectedCard = React.useMemo<KanbanCard | null>(() => {
    if (!board || !selectedCardId) return null;
    for (const list of board.lists) {
      const card = list.cards.find((c) => c.id === selectedCardId);
      if (card) return card;
    }
    return null;
  }, [board, selectedCardId]);

  const handleSelectCard = React.useCallback((card: KanbanCard) => {
    setSelectedCardId(card.id);
  }, []);

  const handleCloseCardDetail = React.useCallback(() => {
    setSelectedCardId(null);
  }, []);

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

  // Action: Status Change (moves card across Kanban lists via moveCard)
  const handleStatusChange = async (card: KanbanCard, targetCategory: ListCategory): Promise<boolean> => {
    if (!board) return false;

    const targetList = board.lists.find((l) => l.category === targetCategory);
    if (!targetList) {
      toast.error(`Target list for category ${targetCategory} not found`);
      return false;
    }

    if (card.listId === targetList.id) return true;

    // Prerequisite validation: if moving to DONE and card is blocked, reject transition
    if (targetCategory === "DONE" && card.isBlocked) {
      toast.error(card.blockReason || "Cannot move to Done: Prerequisite is not completed.");
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
  };

  // Action: Update Card fields with OCC
  const handleUpdateCard = async (cardId: string, payload: UpdateCardInput): Promise<void> => {
    try {
      const updatedCard = await cardApi.updateCard(cardId, payload);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => (c.id === cardId ? updatedCard : c)),
          })),
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update card";
      if (msg.includes("CARD_CONFLICT")) {
        toast.error("Card was modified by another session. Refreshing...");
        void loadBoard();
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  // Action: Delete Card
  const handleDeleteCard = async (cardId: string): Promise<void> => {
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
  };

  // Action: Add Checklist Item
  const handleAddChecklistItem = async (cardId: string, title: string) => {
    try {
      const newItem = await cardApi.addChecklistItem(cardId, title);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const checklist = c.checklist ? [...c.checklist, newItem] : [newItem];
              return {
                ...c,
                checklist,
                tasksCount: checklist.length,
                completedTasksCount: checklist.filter((t) => t.isCompleted).length,
                updatedAt: newItem.updatedAt || c.updatedAt,
              };
            }),
          })),
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add checklist item");
    }
  };

  // Action: Toggle / Update Checklist Item
  const handleToggleChecklistItem = async (cardId: string, taskId: string, isCompleted: boolean) => {
    try {
      const updated = await cardApi.updateChecklistItem(taskId, { isCompleted });
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const checklist = (c.checklist || []).map((t) => (t.id === taskId ? updated : t));
              return {
                ...c,
                checklist,
                completedTasksCount: checklist.filter((t) => t.isCompleted).length,
                updatedAt: updated.updatedAt || c.updatedAt,
              };
            }),
          })),
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update checklist item");
    }
  };

  // Action: Delete Checklist Item
  const handleDeleteChecklistItem = async (cardId: string, taskId: string) => {
    try {
      await cardApi.deleteChecklistItem(taskId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const checklist = (c.checklist || []).filter((t) => t.id !== taskId);
              return {
                ...c,
                checklist,
                tasksCount: checklist.length,
                completedTasksCount: checklist.filter((t) => t.isCompleted).length,
              };
            }),
          })),
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete checklist item");
    }
  };

  // Action: Add Comment
  const handleAddComment = async (cardId: string, content: string) => {
    try {
      const newComment = await cardApi.addComment(cardId, content);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                comments: c.comments ? [...c.comments, newComment] : [newComment],
              };
            }),
          })),
        };
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    }
  };

  // Action: Fetch Card Activities (Lazy)
  const fetchCardActivities = async (cardId: string): Promise<CardActivity[]> => {
    return cardApi.getActivities(cardId);
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

    // Card Detail Selection
    selectedCardId,
    selectedCard,
    handleSelectCard,
    handleCloseCardDetail,

    // Operations
    handleAddCard,
    handleAddColumn,
    handleCommitMoveCard,
    handleStatusChange,
    handleUpdateCard,
    handleDeleteCard,
    handleAddChecklistItem,
    handleToggleChecklistItem,
    handleDeleteChecklistItem,
    handleAddComment,
    fetchCardActivities,
  };
}
