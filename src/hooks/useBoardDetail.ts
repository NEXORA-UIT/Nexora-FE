import * as React from "react";
import { boardApi, cardApi, listApi } from "@/apis";
import { associateCardsWithLists } from "@/mappers/card.mapper";
import { filterCardsByQuery } from "@/utils";
import type {
  BoardDetail,
  KanbanCard,
  KanbanList,
} from "@/types";
import { useBoardCardMutations, useCardSubEntities } from "./board";

export function useBoardDetail(boardId?: string) {
  const [board, setBoard] = React.useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Search & View tab state
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [activeView, setActiveView] = React.useState<"board" | "calendar" | "planning">("board");

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
      const [boardData, allLists, allCards, members, boardLabels] = await Promise.all([
        boardApi.getBoard(boardId),
        listApi.getBoardLists(boardId, { includeArchived: true }),
        cardApi.getBoardCards(boardId),
        boardApi.getBoardMembers(boardId),
        cardApi.getBoardLabels(boardId),
      ]);

      const activeLists = allLists.filter((l) => l.status === "ACTIVE");
      const archivedListsCount = allLists.filter((l) => l.status === "ARCHIVED").length;

      const { lists: populatedLists } = associateCardsWithLists(activeLists, allCards);

      setBoard({
        id: boardData.id,
        workspaceId: boardData.workspaceId,
        name: boardData.name || boardData.title,
        description: boardData.description,
        status: boardData.status === "active" ? "ACTIVE" : "ARCHIVED",
        members,
        labels: boardLabels,
        lists: populatedLists,
        archivedListsCount,
        createdAt: boardData.createdAt,
        updatedAt: boardData.updatedAt,
      });
    } catch (err) {
      setBoard(null);
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

  // Derived all board cards for planning and dependency picker
  const allBoardCards = React.useMemo<KanbanCard[]>(() => {
    if (!board) return [];
    return board.lists.flatMap((l) => l.cards);
  }, [board]);

  // Modular Board Canvas & Card Mutations
  const mutations = useBoardCardMutations({
    boardId,
    board,
    setBoard,
    reloadBoard: loadBoard,
    selectedCardId,
    setSelectedCardId,
  });

  // Modular Card Sub-Entities (tasks, assignments, labels, comments, attachments, dependencies)
  const subEntities = useCardSubEntities({
    selectedCardId,
    board,
    setBoard,
  });

  return {
    board,
    filteredLists,
    allBoardCards,
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
    ...mutations,

    // Sub-entities
    ...subEntities,
  };
}
