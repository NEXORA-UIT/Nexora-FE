import * as React from "react";
import { toast } from "sonner";
import { boardApi, cardApi, listApi } from "@/apis";
import {
  associateCardsWithLists,
  mapCardAssignmentDtosToBoardMembers,
  mapCommentDtoToCardComment,
  mapCommentDtosToCardComments,
  mapAttachmentDtoToCardAttachment,
  mapAttachmentDtosToCardAttachments,
} from "@/mappers/card.mapper";
import { filterCardsByQuery, canMoveCardToDone, isCardBlocked } from "@/utils";
import type {
  BoardDetail,
  BoardMember,
  KanbanCard,
  KanbanList,
  ListCategory,
  MoveCardInput,
  UpdateCardInput,
  CardActivity,
  ChecklistItem,
  PaginatedActivitiesResult,
} from "@/types";

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

  // Task loading & error state
  const [isTasksLoading, setIsTasksLoading] = React.useState<boolean>(false);
  const [tasksError, setTasksError] = React.useState<string | null>(null);

  // Active card ID whose tasks are currently loaded/loading (prevents race conditions)
  const activeTasksCardIdRef = React.useRef<string | null>(null);

  // Assignment loading & error state
  const [isAssignmentsLoading, setIsAssignmentsLoading] = React.useState<boolean>(false);
  const [assignmentsError, setAssignmentsError] = React.useState<string | null>(null);
  const [pendingMemberUserId, setPendingMemberUserId] = React.useState<string | null>(null);

  // Active card ID whose assignments are currently loaded/loading (prevents race conditions)
  const activeAssignmentsCardIdRef = React.useRef<string | null>(null);

  const loadTasksForCard = React.useCallback(async (cardId: string) => {
    activeTasksCardIdRef.current = cardId;
    setIsTasksLoading(true);
    setTasksError(null);
    try {
      const [tasksRes, cardRes] = await Promise.allSettled([
        cardApi.getCardTasks(cardId),
        cardApi.getCardById(cardId),
      ]);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeTasksCardIdRef.current !== cardId) return;

      if (tasksRes.status === "rejected") {
        throw tasksRes.reason;
      }

      const tasks = tasksRes.value;
      const refreshedCard = cardRes.status === "fulfilled" ? cardRes.value : null;

      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const refreshedTime = refreshedCard ? new Date(refreshedCard.updatedAt).getTime() : NaN;
              const currentTime = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
              const isNewerOrEqual = !isNaN(refreshedTime) && (isNaN(currentTime) || refreshedTime >= currentTime);
              const nextUpdatedAt = isNewerOrEqual && refreshedCard ? refreshedCard.updatedAt : c.updatedAt;

              return {
                ...c,
                checklist: tasks,
                tasksCount: tasks.length,
                completedTasksCount: tasks.filter((t) => t.isCompleted).length,
                updatedAt: nextUpdatedAt,
              };
            }),
          })),
        };
      });

      if (cardRes.status === "rejected") {
        setTasksError("Unable to sync latest card timestamp with server.");
      } else {
        setTasksError(null);
      }
    } catch (err) {
      if (activeTasksCardIdRef.current !== cardId) return;
      setTasksError(err instanceof Error ? err.message : "Failed to load checklist tasks");
    } finally {
      if (activeTasksCardIdRef.current === cardId) {
        setIsTasksLoading(false);
      }
    }
  }, []);

  const loadAssignmentsForCard = React.useCallback(async (cardId: string) => {
    activeAssignmentsCardIdRef.current = cardId;
    setIsAssignmentsLoading(true);
    setAssignmentsError(null);
    try {
      const assignments = await cardApi.getCardAssignments(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeAssignmentsCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        const mappedAssignees = mapCardAssignmentDtosToBoardMembers(assignments, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                assignees: mappedAssignees,
              };
            }),
          })),
        };
      });
      setAssignmentsError(null);
    } catch (err) {
      if (activeAssignmentsCardIdRef.current !== cardId) return;
      setAssignmentsError(err instanceof Error ? err.message : "Failed to load card assignments");
    } finally {
      if (activeAssignmentsCardIdRef.current === cardId) {
        setIsAssignmentsLoading(false);
      }
    }
  }, []);

  // Label loading & error state
  const [isLabelsLoading, setIsLabelsLoading] = React.useState<boolean>(false);
  const [labelsError, setLabelsError] = React.useState<string | null>(null);
  const [pendingLabelId, setPendingLabelId] = React.useState<string | null>(null);

  // Active card ID whose labels are currently loaded/loading (prevents race conditions)
  const activeLabelsCardIdRef = React.useRef<string | null>(null);

  const loadLabelsForCard = React.useCallback(async (cardId: string) => {
    activeLabelsCardIdRef.current = cardId;
    setIsLabelsLoading(true);
    setLabelsError(null);
    try {
      const labels = await cardApi.getCardLabels(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeLabelsCardIdRef.current !== cardId) return;

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
                labels,
              };
            }),
          })),
        };
      });
      setLabelsError(null);
    } catch (err) {
      if (activeLabelsCardIdRef.current !== cardId) return;
      setLabelsError(err instanceof Error ? err.message : "Failed to load card labels");
    } finally {
      if (activeLabelsCardIdRef.current === cardId) {
        setIsLabelsLoading(false);
      }
    }
  }, []);

  // Comment loading & error state
  const [isCommentsLoading, setIsCommentsLoading] = React.useState<boolean>(false);
  const [commentsError, setCommentsError] = React.useState<string | null>(null);

  // Active card ID whose comments are currently loaded/loading (prevents race conditions)
  const activeCommentsCardIdRef = React.useRef<string | null>(null);

  const loadCommentsForCard = React.useCallback(async (cardId: string) => {
    activeCommentsCardIdRef.current = cardId;
    setIsCommentsLoading(true);
    setCommentsError(null);
    try {
      const comments = await cardApi.getCardComments(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeCommentsCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        const mappedComments = mapCommentDtosToCardComments(comments, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                comments: mappedComments,
              };
            }),
          })),
        };
      });
      setCommentsError(null);
    } catch (err) {
      if (activeCommentsCardIdRef.current !== cardId) return;
      setCommentsError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      if (activeCommentsCardIdRef.current === cardId) {
        setIsCommentsLoading(false);
      }
    }
  }, []);

  // Attachment loading, error, & uploading state
  const [isAttachmentsLoading, setIsAttachmentsLoading] = React.useState<boolean>(false);
  const [attachmentsError, setAttachmentsError] = React.useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = React.useState<boolean>(false);
  const [pendingAttachmentId, setPendingAttachmentId] = React.useState<string | null>(null);

  // Active card ID whose attachments are currently loading (prevents race conditions)
  const activeAttachmentsCardIdRef = React.useRef<string | null>(null);

  const loadAttachmentsForCard = React.useCallback(async (cardId: string) => {
    activeAttachmentsCardIdRef.current = cardId;
    setIsAttachmentsLoading(true);
    setAttachmentsError(null);
    try {
      const attachments = await cardApi.getCardAttachments(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeAttachmentsCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        const mappedAttachments = mapAttachmentDtosToCardAttachments(attachments, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                attachments: mappedAttachments,
              };
            }),
          })),
        };
      });
      setAttachmentsError(null);
    } catch (err) {
      if (activeAttachmentsCardIdRef.current !== cardId) return;
      setAttachmentsError(err instanceof Error ? err.message : "Failed to load attachments");
    } finally {
      if (activeAttachmentsCardIdRef.current === cardId) {
        setIsAttachmentsLoading(false);
      }
    }
  }, []);

  // Dependencies loading & error state
  const [isDependenciesLoading, setIsDependenciesLoading] = React.useState<boolean>(false);
  const [dependenciesError, setDependenciesError] = React.useState<string | null>(null);

  // Active card ID whose dependencies are currently loading (prevents race conditions)
  const activeDependenciesCardIdRef = React.useRef<string | null>(null);

  const loadDependenciesForCard = React.useCallback(async (cardId: string) => {
    activeDependenciesCardIdRef.current = cardId;
    setIsDependenciesLoading(true);
    setDependenciesError(null);
    try {
      const dependencies = await cardApi.getCardDependencies(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeDependenciesCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const updatedCard = { ...c, dependencies };
              const { isBlocked, blockReason } = isCardBlocked(updatedCard, prev.lists);
              return {
                ...updatedCard,
                dependencies,
                isBlocked,
                blockReason,
              };
            }),
          })),
        };
      });
      setDependenciesError(null);
    } catch (err) {
      if (activeDependenciesCardIdRef.current !== cardId) return;
      setDependenciesError(err instanceof Error ? err.message : "Failed to load dependencies");
    } finally {
      if (activeDependenciesCardIdRef.current === cardId) {
        setIsDependenciesLoading(false);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!selectedCardId) {
      activeTasksCardIdRef.current = null;
      setIsTasksLoading(false);
      setTasksError(null);

      activeAssignmentsCardIdRef.current = null;
      setIsAssignmentsLoading(false);
      setAssignmentsError(null);

      activeLabelsCardIdRef.current = null;
      setIsLabelsLoading(false);
      setLabelsError(null);

      activeCommentsCardIdRef.current = null;
      setIsCommentsLoading(false);
      setCommentsError(null);

      activeAttachmentsCardIdRef.current = null;
      setIsAttachmentsLoading(false);
      setAttachmentsError(null);
      setIsUploadingAttachment(false);
      setPendingAttachmentId(null);

      activeDependenciesCardIdRef.current = null;
      setIsDependenciesLoading(false);
      setDependenciesError(null);
      return;
    }

    void loadTasksForCard(selectedCardId);
    void loadAssignmentsForCard(selectedCardId);
    void loadLabelsForCard(selectedCardId);
    void loadCommentsForCard(selectedCardId);
    void loadAttachmentsForCard(selectedCardId);
    void loadDependenciesForCard(selectedCardId);

    return () => {
      if (activeTasksCardIdRef.current === selectedCardId) {
        activeTasksCardIdRef.current = null;
      }
      if (activeAssignmentsCardIdRef.current === selectedCardId) {
        activeAssignmentsCardIdRef.current = null;
      }
      if (activeLabelsCardIdRef.current === selectedCardId) {
        activeLabelsCardIdRef.current = null;
      }
      if (activeCommentsCardIdRef.current === selectedCardId) {
        activeCommentsCardIdRef.current = null;
      }
      if (activeAttachmentsCardIdRef.current === selectedCardId) {
        activeAttachmentsCardIdRef.current = null;
      }
      if (activeDependenciesCardIdRef.current === selectedCardId) {
        activeDependenciesCardIdRef.current = null;
      }
    };
  }, [
    selectedCardId,
    loadTasksForCard,
    loadAssignmentsForCard,
    loadLabelsForCard,
    loadCommentsForCard,
    loadAttachmentsForCard,
    loadDependenciesForCard,
  ]);

  const handleRetryDependencies = React.useCallback(() => {
    if (selectedCardId) {
      void loadDependenciesForCard(selectedCardId);
    }
  }, [selectedCardId, loadDependenciesForCard]);

  const handleRetryComments = React.useCallback(() => {
    if (selectedCardId) {
      void loadCommentsForCard(selectedCardId);
    }
  }, [selectedCardId, loadCommentsForCard]);

  const handleRetryAttachments = React.useCallback(() => {
    if (selectedCardId) {
      void loadAttachmentsForCard(selectedCardId);
    }
  }, [selectedCardId, loadAttachmentsForCard]);

  const handleRetryTasks = React.useCallback(() => {
    if (selectedCardId) {
      void loadTasksForCard(selectedCardId);
    }
  }, [selectedCardId, loadTasksForCard]);

  const handleRetryAssignments = React.useCallback(async () => {
    if (!selectedCardId) return;
    await loadAssignmentsForCard(selectedCardId);
    try {
      const refreshedCard = await cardApi.getCardById(selectedCardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== selectedCardId) return c;
              const refreshedTime = new Date(refreshedCard.updatedAt).getTime();
              const currentTime = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
              const isStrictlyNewer = !isNaN(refreshedTime) && (isNaN(currentTime) || refreshedTime > currentTime);

              return {
                ...c,
                updatedAt: isStrictlyNewer ? refreshedCard.updatedAt : c.updatedAt,
                tasksCount: isStrictlyNewer ? refreshedCard.tasksCount : (c.tasksCount ?? c.checklist?.length ?? 0),
                completedTasksCount: isStrictlyNewer
                  ? refreshedCard.completedTasksCount
                  : (c.completedTasksCount ?? c.checklist?.filter((t) => t.isCompleted).length ?? 0),
              };
            }),
          })),
        };
      });
      setAssignmentsError(null);
    } catch {
      setAssignmentsError("Unable to sync latest card timestamp with server.");
    }
  }, [selectedCardId, loadAssignmentsForCard]);

  const handleRetryLabels = React.useCallback(async () => {
    if (!selectedCardId) return;
    await loadLabelsForCard(selectedCardId);
    try {
      const refreshedCard = await cardApi.getCardById(selectedCardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== selectedCardId) return c;
              const refreshedTime = new Date(refreshedCard.updatedAt).getTime();
              const currentTime = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
              const isStrictlyNewer = !isNaN(refreshedTime) && (isNaN(currentTime) || refreshedTime > currentTime);

              return {
                ...c,
                updatedAt: isStrictlyNewer ? refreshedCard.updatedAt : c.updatedAt,
                tasksCount: isStrictlyNewer ? refreshedCard.tasksCount : (c.tasksCount ?? c.checklist?.length ?? 0),
                completedTasksCount: isStrictlyNewer
                  ? refreshedCard.completedTasksCount
                  : (c.completedTasksCount ?? c.checklist?.filter((t) => t.isCompleted).length ?? 0),
              };
            }),
          })),
        };
      });
      setLabelsError(null);
    } catch {
      setLabelsError("Unable to sync latest card timestamp with server.");
    }
  }, [selectedCardId, loadLabelsForCard]);

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
      if (msg.includes("CARD_CONFLICT") || msg.includes("409")) {
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

  /**
   * Safely reconciles parent Card's updatedAt and taskProgress from authoritative backend.
   * If Card fetch fails, preserves successful task mutation without fabricating updatedAt.
   */
  const reconcileParentCard = async (
    cardId: string,
    updateChecklist: (prevChecklist: ChecklistItem[]) => ChecklistItem[]
  ) => {
    // 1. Immediately apply the task mutation to local state so the UI is responsive and consistent
    setBoard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lists: prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => {
            if (c.id !== cardId) return c;
            const nextChecklist = updateChecklist(c.checklist || []);
            return {
              ...c,
              checklist: nextChecklist,
              tasksCount: nextChecklist.length,
              completedTasksCount: nextChecklist.filter((t) => t.isCompleted).length,
            };
          }),
        })),
      };
    });

    // 2. Authoritatively fetch refreshed parent Card (updatedAt & taskProgress)
    try {
      const refreshedCard = await cardApi.getCardById(cardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              // Guard against stale refresh response: only apply if refreshedCard is as new or newer
              const refreshedTime = new Date(refreshedCard.updatedAt).getTime();
              const currentTime = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
              if (!isNaN(refreshedTime) && !isNaN(currentTime) && refreshedTime < currentTime) return c;

              const isStrictlyNewer = !isNaN(refreshedTime) && (isNaN(currentTime) || refreshedTime > currentTime);

              return {
                ...c,
                updatedAt: isStrictlyNewer ? refreshedCard.updatedAt : c.updatedAt,
                tasksCount: isStrictlyNewer ? refreshedCard.tasksCount : (c.tasksCount ?? c.checklist?.length ?? 0),
                completedTasksCount: isStrictlyNewer
                  ? refreshedCard.completedTasksCount
                  : (c.completedTasksCount ?? c.checklist?.filter((t) => t.isCompleted).length ?? 0),
              };
            }),
          })),
        };
      });
      setTasksError(null);
    } catch {
      // Separation of mutation success from reconciliation failure:
      // Mutation succeeded, but card refresh had a transient error.
      // Do not roll back mutation or fabricate updatedAt.
      setTasksError("Unable to sync latest card timestamp. Click Retry to sync.");
      toast.warning("Task updated, but unable to sync latest card timestamp. Click Retry in checklist to sync.");
    }
  };

  // Action: Add Checklist Item
  const handleAddChecklistItem = async (cardId: string, title: string) => {
    try {
      const newItem = await cardApi.addChecklistItem(cardId, title);
      await reconcileParentCard(cardId, (prev) =>
        prev.some((t) => t.id === newItem.id) ? prev : [...prev, newItem]
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add checklist item";
      if (msg.includes("TASK_LIMIT_REACHED") || (err as { code?: string })?.code === "TASK_LIMIT_REACHED") {
        toast.error("Checklist limit reached: A card can have at most 50 tasks.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  // Action: Toggle / Update Checklist Item
  const handleToggleChecklistItem = async (cardId: string, taskId: string, isCompleted: boolean) => {
    try {
      const updated = await cardApi.updateChecklistItem(taskId, { isCompleted });
      await reconcileParentCard(cardId, (prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update checklist item");
      throw err;
    }
  };

  // Action: Delete Checklist Item
  const handleDeleteChecklistItem = async (cardId: string, taskId: string) => {
    try {
      await cardApi.deleteChecklistItem(taskId);
      await reconcileParentCard(cardId, (prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete checklist item");
      throw err;
    }
  };

  /**
   * Safely reconciles parent Card's updatedAt after card assignment mutations.
   * If Card fetch fails, preserves successful assignment mutation without fabricating updatedAt.
   */
  const reconcileCardTimestamp = async (
    cardId: string,
    context: "assignments" | "labels" = "assignments"
  ) => {
    try {
      const refreshedCard = await cardApi.getCardById(cardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              // Guard against stale refresh response: only apply if refreshedCard is as new or newer
              const refreshedTime = new Date(refreshedCard.updatedAt).getTime();
              const currentTime = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
              if (!isNaN(refreshedTime) && !isNaN(currentTime) && refreshedTime < currentTime) return c;

              const isStrictlyNewer = !isNaN(refreshedTime) && (isNaN(currentTime) || refreshedTime > currentTime);

              return {
                ...c,
                updatedAt: isStrictlyNewer ? refreshedCard.updatedAt : c.updatedAt,
                tasksCount: isStrictlyNewer ? refreshedCard.tasksCount : (c.tasksCount ?? c.checklist?.length ?? 0),
                completedTasksCount: isStrictlyNewer
                  ? refreshedCard.completedTasksCount
                  : (c.completedTasksCount ?? c.checklist?.filter((t) => t.isCompleted).length ?? 0),
              };
            }),
          })),
        };
      });
      if (context === "assignments") {
        setAssignmentsError(null);
      } else {
        setLabelsError(null);
      }
    } catch {
      // Mutation succeeded, but card refresh had a transient error.
      // Do not roll back mutation or fabricate updatedAt.
      const errorMsg = "Unable to sync latest card timestamp. Click Retry to sync.";
      if (context === "assignments") {
        setAssignmentsError(errorMsg);
        toast.warning("Member updated, but unable to sync latest card timestamp. Click Retry to sync.");
      } else {
        setLabelsError(errorMsg);
        toast.warning("Label updated, but unable to sync latest card timestamp. Click Retry to sync.");
      }
    }
  };

  // Action: Assign Member to Card
  const handleAssignMember = async (cardId: string, userId: string) => {
    if (pendingMemberUserId === userId) return;
    setPendingMemberUserId(userId);
    try {
      await cardApi.assignCardMember(cardId, userId);

      // Only on verified success, update local state
      setBoard((prev) => {
        if (!prev) return prev;
        const targetMember: BoardMember = prev.members.find((m) => m.id === userId) || {
          id: userId,
          name: "Member",
          initials: "M",
          role: "MEMBER" as const,
        };

        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const alreadyAssigned = c.assignees.some((a) => a.id === userId);
              if (alreadyAssigned) return c;
              return {
                ...c,
                assignees: [...c.assignees, targetMember],
              };
            }),
          })),
        };
      });

      toast.success("Member assigned.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign member";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "ASSIGNMENT_EXISTS" || status === 409 || msg.includes("ASSIGNMENT_EXISTS") || msg.includes("409")) {
        toast.info("This member is already assigned to this card.");
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission, or this member is not eligible.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or member not found, or assignment data has changed.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingMemberUserId(null);
    }
  };

  // Action: Unassign Member from Card
  const handleUnassignMember = async (cardId: string, userId: string) => {
    if (pendingMemberUserId === userId) return;
    setPendingMemberUserId(userId);
    try {
      await cardApi.unassignCardMember(cardId, userId);

      // Only on verified success, update local state
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
                assignees: c.assignees.filter((a) => a.id !== userId),
              };
            }),
          })),
        };
      });

      toast.success("Member unassigned.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to unassign member";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to unassign this member.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or assignment not found.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingMemberUserId(null);
    }
  };

  // Action: Attach Label to Card
  const handleAttachCardLabel = async (cardId: string, labelId: string) => {
    if (pendingLabelId === labelId) return;
    setPendingLabelId(labelId);
    try {
      const attachedLabel = await cardApi.attachCardLabel(cardId, labelId);

      // Only on verified success, update local state
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const alreadyAttached = c.labels.some((l) => l.id === labelId);
              if (alreadyAttached) return c;
              return {
                ...c,
                labels: [...c.labels, attachedLabel],
              };
            }),
          })),
        };
      });

      toast.success("Label attached.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId, "labels");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to attach label";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "CARD_LABEL_EXISTS" || status === 409 || msg.includes("CARD_LABEL_EXISTS") || msg.includes("409")) {
        toast.info("This label is already attached to this card.");
        void loadLabelsForCard(cardId);
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission, or this card is archived.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or label not found, or label belongs to another board.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingLabelId(null);
    }
  };

  // Action: Detach Label from Card
  const handleDetachCardLabel = async (cardId: string, labelId: string) => {
    if (pendingLabelId === labelId) return;
    setPendingLabelId(labelId);
    try {
      await cardApi.detachCardLabel(cardId, labelId);

      // Only on verified success, update local state
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
                labels: c.labels.filter((l) => l.id !== labelId),
              };
            }),
          })),
        };
      });

      toast.success("Label detached.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId, "labels");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to detach label";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to detach this label.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or label attachment not found.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingLabelId(null);
    }
  };

  // Action: Add Comment
  const handleAddComment = async (cardId: string, content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      const newDto = await cardApi.createCardComment(cardId, trimmed);
      setBoard((prev) => {
        if (!prev) return prev;
        const newComment = mapCommentDtoToCardComment(newDto, prev.members);
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
      toast.success("Comment added.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add comment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "COMMENT_INVALID" || msg.includes("COMMENT_INVALID")) {
        toast.error("Comment content must be between 1 and 10,000 characters.");
      } else if (code === "MENTION_INVALID" || msg.includes("MENTION_INVALID")) {
        toast.error("Mentioned user must be a member of this board.");
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to comment on this card.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  // Action: Update Comment
  const handleUpdateComment = async (commentId: string, content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      const updatedDto = await cardApi.updateCardComment(commentId, trimmed);
      setBoard((prev) => {
        if (!prev) return prev;
        const updatedComment = mapCommentDtoToCardComment(updatedDto, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (!c.comments?.some((cmt) => cmt.id === commentId)) return c;
              return {
                ...c,
                comments: c.comments.map((cmt) => (cmt.id === commentId ? updatedComment : cmt)),
              };
            }),
          })),
        };
      });
      toast.success("Comment updated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update comment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to edit this comment.");
      } else if (code === "COMMENT_INVALID" || msg.includes("COMMENT_INVALID")) {
        toast.error("Comment content must be between 1 and 10,000 characters.");
      } else if (code === "MENTION_INVALID" || msg.includes("MENTION_INVALID")) {
        toast.error("Mentioned user must be a member of this board.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Comment not found or already deleted.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  // Action: Delete Comment
  const handleDeleteComment = async (commentId: string): Promise<void> => {
    try {
      await cardApi.deleteCardComment(commentId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (!c.comments?.some((cmt) => cmt.id === commentId)) return c;
              return {
                ...c,
                comments: c.comments.map((cmt) => {
                  if (cmt.id !== commentId) return cmt;
                  return {
                    ...cmt,
                    content: null,
                    deletedAt: new Date().toISOString(),
                    isDeleted: true,
                  };
                }),
              };
            }),
          })),
        };
      });
      toast.success("Comment deleted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete comment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to delete this comment.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Comment not found or already deleted.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  // Action: Upload Attachment
  const handleUploadAttachment = async (cardId: string, file: File): Promise<void> => {
    setIsUploadingAttachment(true);
    try {
      const newDto = await cardApi.uploadCardAttachment(cardId, file);
      setBoard((prev) => {
        if (!prev) return prev;
        const newAttachment = mapAttachmentDtoToCardAttachment(newDto, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                attachments: c.attachments ? [...c.attachments, newAttachment] : [newAttachment],
              };
            }),
          })),
        };
      });
      toast.success("Attachment uploaded.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload attachment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "PAYLOAD_TOO_LARGE" || status === 413 || msg.includes("PAYLOAD_TOO_LARGE") || msg.includes("413")) {
        toast.error("File size exceeds 25MB limit.");
      } else if (code === "ATTACHMENT_TYPE_INVALID" || msg.includes("ATTACHMENT_TYPE_INVALID")) {
        toast.error("Invalid file format. Allowed formats: PDF, DOCX, TXT, PNG, JPG.");
      } else if (code === "ATTACHMENT_EMPTY" || msg.includes("ATTACHMENT_EMPTY")) {
        toast.error("Attachment file cannot be empty.");
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to upload attachments to this card.");
      } else if (code === "ARCHIVED" || msg.includes("ARCHIVED")) {
        toast.error("Cannot upload attachments to an archived card or board.");
      } else if (code === "FROZEN" || msg.includes("FROZEN")) {
        toast.error("Board is frozen. File upload disabled.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  // Action: Delete Attachment
  const handleDeleteAttachment = async (attachmentId: string): Promise<void> => {
    setPendingAttachmentId(attachmentId);
    try {
      await cardApi.deleteCardAttachment(attachmentId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (!c.attachments?.some((att) => att.id === attachmentId)) return c;
              return {
                ...c,
                attachments: c.attachments.filter((att) => att.id !== attachmentId),
              };
            }),
          })),
        };
      });
      toast.success("Attachment deleted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete attachment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to delete this attachment.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Attachment not found or already deleted.");
      } else if (code === "ARCHIVED" || msg.includes("ARCHIVED")) {
        toast.error("Cannot delete attachments from an archived card or board.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingAttachmentId(null);
    }
  };

  // Action: Download Attachment
  const handleDownloadAttachment = async (attachmentId: string): Promise<Blob> => {
    try {
      return await cardApi.downloadCardAttachment(attachmentId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to download attachment";
      const status = (err as { status?: number })?.status;
      if (status === 403) {
        toast.error("You do not have permission to download this attachment.");
      } else if (status === 404) {
        toast.error("Attachment not found.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  };

  // Action: Fetch Card Activities (Lazy with cursor pagination support)
  const fetchCardActivities = async (
    cardId: string,
    cursor?: string
  ): Promise<CardActivity[] | PaginatedActivitiesResult> => {
    return cardApi.getCardActivities(cardId, { cursor, limit: 20 }, board?.members);
  };

  // Derived all board cards for planning and dependency picker
  const allBoardCards = React.useMemo<KanbanCard[]>(() => {
    if (!board) return [];
    return board.lists.flatMap((l) => l.cards);
  }, [board]);

  // Action: Add Dependency (Optimistic with rollback)
  const handleAddDependency = async (cardId: string, prerequisiteCardId: string): Promise<void> => {
    if (!board) return;
    const previousBoard = JSON.parse(JSON.stringify(board)) as BoardDetail;

    try {
      const newDep = await cardApi.addDependency(cardId, { dependsOnCardId: prerequisiteCardId });
      setBoard((prev) => {
        if (!prev) return prev;
        const nextLists = prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => {
            if (c.id === cardId) {
              const updatedDeps = [...(c.dependencies || []), newDep];
              const updatedCard = { ...c, dependencies: updatedDeps };
              const { isBlocked, blockReason } = isCardBlocked(updatedCard, prev.lists);
              return { ...updatedCard, isBlocked, blockReason };
            }
            return c;
          }),
        }));
        return { ...prev, lists: nextLists };
      });
      toast.success("Dependency added");
    } catch (err) {
      setBoard(previousBoard);
      const msg = err instanceof Error ? err.message : "Failed to add dependency";
      toast.error(msg);
      throw err;
    }
  };

  // Action: Delete Dependency (Optimistic with rollback)
  const handleDeleteDependency = async (cardId: string, dependencyId: string): Promise<void> => {
    if (!board) return;
    const previousBoard = JSON.parse(JSON.stringify(board)) as BoardDetail;

    try {
      await cardApi.deleteDependency(cardId, dependencyId);
      setBoard((prev) => {
        if (!prev) return prev;
        const nextLists = prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => {
            if (c.id === cardId) {
              const updatedDeps = (c.dependencies || []).filter((d) => d.id !== dependencyId);
              const updatedCard = { ...c, dependencies: updatedDeps };
              const { isBlocked, blockReason } = isCardBlocked(updatedCard, prev.lists);
              return { ...updatedCard, isBlocked, blockReason };
            }
            return c;
          }),
        }));
        return { ...prev, lists: nextLists };
      });
      toast.success("Dependency removed");
    } catch (err) {
      setBoard(previousBoard);
      const msg = err instanceof Error ? err.message : "Failed to delete dependency";
      toast.error(msg);
      throw err;
    }
  };

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
    handleAddCard,
    handleAddColumn,
    handleCommitMoveCard,
    handleStatusChange,
    handleUpdateCard,
    handleDeleteCard,
    handleAddChecklistItem,
    handleToggleChecklistItem,
    handleDeleteChecklistItem,
    isTasksLoading,
    tasksError,
    handleRetryTasks,

    // Card Assignments
    isAssignmentsLoading,
    assignmentsError,
    handleRetryAssignments,
    handleAssignMember,
    handleUnassignMember,
    pendingMemberUserId,

    // Card Labels
    isLabelsLoading,
    labelsError,
    handleRetryLabels,
    handleAttachCardLabel,
    handleDetachCardLabel,
    pendingLabelId,

    // Card Comments
    isCommentsLoading,
    commentsError,
    handleRetryComments,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,

    // Card Attachments
    isAttachmentsLoading,
    attachmentsError,
    isUploadingAttachment,
    pendingAttachmentId,
    handleRetryAttachments,
    handleUploadAttachment,
    handleDeleteAttachment,
    handleDownloadAttachment,
    // Card Dependencies
    isDependenciesLoading,
    dependenciesError,
    handleRetryDependencies,
    handleAddDependency,
    handleDeleteDependency,

    fetchCardActivities,
  };
}
