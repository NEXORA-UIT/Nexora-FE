import * as React from "react";
import { toast } from "sonner";
import { boardApi, cardApi, listApi } from "@/apis";
import { associateCardsWithLists } from "@/mappers/card.mapper";
import { filterCards, filterCardsByQuery, getUserFacingApiError } from "@/utils";
import type {
  BoardCardFilters,
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
  const [cardFilters, setCardFilters] = React.useState<BoardCardFilters>({
    statusGroup: "ALL",
    priority: "ALL",
    assigneeIds: [],
    dueDate: "ALL",
    labelIds: [],
  });
  const [serverFilteredCardIds, setServerFilteredCardIds] = React.useState<Set<string> | null>(null);
  const cardFilterRequestId = React.useRef(0);
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
      const [boardData, allLists, members, boardLabels] = await Promise.all([
        boardApi.getBoard(boardId),
        listApi.getBoardLists(boardId, { includeArchived: true }),
        boardApi.getBoardMembers(boardId),
        cardApi.getBoardLabels(boardId),
      ]);
      const allCards = await cardApi.getBoardCards(boardId, undefined, members);

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
      setError(getUserFacingApiError(err, "Failed to load board"));
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  React.useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  React.useEffect(() => {
    if (!board || !boardId) return;
    const query = searchQuery.trim();
    const hasServerFilters = Boolean(
      query || cardFilters.statusGroup !== "ALL" || cardFilters.assigneeIds.length > 0 ||
      cardFilters.labelIds.length > 0 || cardFilters.dueDate === "OVERDUE"
    );
    const requestId = ++cardFilterRequestId.current;
    if (!hasServerFilters) {
      setServerFilteredCardIds(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      void cardApi.getBoardCards(boardId, {
        q: query || undefined,
        statusGroup: cardFilters.statusGroup === "ALL" ? undefined : cardFilters.statusGroup,
        isOverdue: cardFilters.dueDate === "OVERDUE" ? true : undefined,
        assigneeId: cardFilters.assigneeIds.length ? cardFilters.assigneeIds : undefined,
        labelId: cardFilters.labelIds.length ? cardFilters.labelIds : undefined,
      }, board.members).then((cards) => {
        if (requestId === cardFilterRequestId.current) {
          setServerFilteredCardIds(new Set(cards.map((card) => card.id)));
        }
      }).catch(() => {
        if (requestId === cardFilterRequestId.current) {
          setServerFilteredCardIds(null);
          toast.error("Could not apply filters to this Board.");
        }
      });
    }, query ? 250 : 0);

    return () => window.clearTimeout(timeout);
  }, [board, boardId, cardFilters, searchQuery]);

  // Apply server filters first, then filters the server does not support.
  const filteredLists = React.useMemo<KanbanList[]>(() => {
    if (!board) return [];
    return board.lists.map((list) => ({
      ...list,
      cards: filterCards(
        filterCardsByQuery(list.cards.filter((card) =>
          !serverFilteredCardIds || serverFilteredCardIds.has(card.id)
        ), serverFilteredCardIds ? "" : searchQuery),
        serverFilteredCardIds && cardFilters.dueDate === "OVERDUE"
          ? { ...cardFilters, statusGroup: "ALL", assigneeIds: [], labelIds: [], dueDate: "ALL" }
          : serverFilteredCardIds
            ? { ...cardFilters, statusGroup: "ALL", assigneeIds: [], labelIds: [] }
            : cardFilters,
      ),
    }));
  }, [board, searchQuery, cardFilters, serverFilteredCardIds]);

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
    cardFilters,
    setCardFilters,
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
