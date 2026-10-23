import * as React from "react";
import { toast } from "sonner";
import { boardApi, cardApi, listApi } from "@/apis";
import { associateCardsWithLists } from "@/mappers/card.mapper";
import { filterCards, filterCardsByQuery, getUserFacingApiError } from "@/utils";
import type {
  Board,
  BoardCardFilters,
  BoardDetail,
  KanbanCard,
  KanbanList,
  UpdateBoardRequest,
} from "@/types";
import { useBoardCardMutations, useCardSubEntities } from "./board";
import { useBoardRealtime, type UseBoardRealtimeReturn } from "./useBoardRealtime";

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

  const realtimeRef = React.useRef<UseBoardRealtimeReturn | null>(null);

  // Clear board state immediately when switching to a different boardId
  const prevLoadedBoardIdRef = React.useRef<string | undefined>(boardId);
  React.useEffect(() => {
    if (prevLoadedBoardIdRef.current !== boardId) {
      prevLoadedBoardIdRef.current = boardId;
      setBoard(null);
      setSelectedCardId(null);
    }
  }, [boardId]);

  const loadBoard = React.useCallback(async () => {
    if (!boardId) {
      setError("Board ID is required");
      setIsLoading(false);
      return;
    }

    const generationId = realtimeRef.current ? realtimeRef.current.beginSnapshot() : 0;
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

      // Filter out any cards that were deleted while the snapshot was loading
      const validCards = realtimeRef.current
        ? allCards.filter((c) => !realtimeRef.current!.isCardDeleted(c.id))
        : allCards;

      const activeLists = allLists.filter((l) => l.status === "ACTIVE");
      const archivedListsCount = allLists.filter((l) => l.status === "ARCHIVED").length;

      const { lists: populatedLists } = associateCardsWithLists(activeLists, validCards);

      const apply = () => {
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
      };

      if (realtimeRef.current) {
        const committed = realtimeRef.current.commitSnapshot(generationId, apply);
        if (!committed) {
          // Stale snapshot: a newer snapshot has already started; discard this response
          return;
        }
      } else {
        apply();
      }
    } catch (err) {
      if (!realtimeRef.current || realtimeRef.current.isCurrentGeneration(generationId)) {
        setError(getUserFacingApiError(err, "Failed to load board"));
        // Retain current board if it matches boardId so buffered events can replay.
        // If initial load or boardId mismatch, clear the board state.
        setBoard((prev) => (prev && prev.id === boardId ? prev : null));
        realtimeRef.current?.cancelSnapshot(generationId);
      }
    } finally {
      if (!realtimeRef.current || realtimeRef.current.isCurrentGeneration(generationId)) {
        setIsLoading(false);
      }
    }
  }, [boardId]);

  const realtime = useBoardRealtime({
    boardId,
    setBoard,
    reloadBoard: loadBoard,
  });
  realtimeRef.current = realtime;

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

  // Effect: When selectedCard is removed (deleted or archived), clear selectedCardId and notify user
  const prevExistingCardsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!board) {
      prevExistingCardsRef.current.clear();
      return;
    }
    const currentCardIds = new Set(board.lists.flatMap((l) => l.cards.map((c) => c.id)));

    if (
      selectedCardId &&
      !currentCardIds.has(selectedCardId) &&
      prevExistingCardsRef.current.has(selectedCardId)
    ) {
      if (realtime.isCardDeleted(selectedCardId)) {
        toast.info("The card you were viewing was deleted.");
      } else {
        toast.info("The card you were viewing was archived.");
      }
      setSelectedCardId(null);
    }

    prevExistingCardsRef.current = currentCardIds;
  }, [board, selectedCardId, realtime]);

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

  const handleUpdateBoard = React.useCallback(
    async (payload: UpdateBoardRequest): Promise<Board> => {
      if (!boardId) {
        throw new Error("Board ID is required");
      }
      const requestedBoardId = boardId;
      const updated = await boardApi.updateBoard(requestedBoardId, payload);
      setBoard((prev) => {
        if (!prev || prev.id !== requestedBoardId) return prev;
        return {
          ...prev,
          name: updated.name || updated.title || prev.name,
          description: updated.description !== undefined ? updated.description : prev.description,
          updatedAt: updated.updatedAt || prev.updatedAt,
        };
      });
      return updated;
    },
    [boardId]
  );

  return {
    wsStatus: realtime.wsStatus,
    isLive: realtime.isLive,
    realtime,
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
    handleUpdateBoard,
    ...mutations,

    // Sub-entities
    ...subEntities,
  };
}
