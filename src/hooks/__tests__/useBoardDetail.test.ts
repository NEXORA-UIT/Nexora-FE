import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBoardDetail } from "../useBoardDetail";
import { boardApi } from "@/apis/board.api";
import { listApi } from "@/apis/list.api";
import { cardApi } from "@/apis/card.api";
import type { Board, KanbanList, KanbanCard, BoardMember, ChecklistItem, CardAssignmentDto, BoardLabel } from "@/types";

describe("useBoardDetail Live Read Integration & State Orchestration", () => {
  const mockBoard: Board = {
    id: "b-uuid-1",
    workspaceId: "ws-uuid-1",
    title: "Engineering Kanban",
    name: "Engineering Kanban",
    status: "active",
    description: "Core sprint board",
    coverColor: "#3B82F6",
    coverUrl: null,
    createdAt: "2026-10-09T00:00:00.000Z",
    updatedAt: "2026-10-09T00:00:00.000Z",
  };

  const mockLists: KanbanList[] = [
    {
      id: "list-uuid-todo",
      boardId: "b-uuid-1",
      name: "TO DO",
      category: "TODO",
      position: 1024,
      status: "ACTIVE",
      cards: [],
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    },
    {
      id: "list-uuid-done",
      boardId: "b-uuid-1",
      name: "DONE",
      category: "DONE",
      position: 2048,
      status: "ACTIVE",
      cards: [],
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    },
    {
      id: "list-uuid-archived",
      boardId: "b-uuid-1",
      name: "OLD BACKLOG",
      category: "TODO",
      position: 3072,
      status: "ARCHIVED",
      cards: [],
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    },
  ];

  const mockCards: KanbanCard[] = [
    {
      id: "card-uuid-101",
      listId: "list-uuid-todo",
      boardId: "b-uuid-1",
      code: "NEX-101",
      title: "Active task 101",
      priority: "HIGH",
      position: 1024,
      status: "ACTIVE",
      statusGroup: "TODO",
      assignees: [],
      labels: [],
      tasksCount: 2,
      completedTasksCount: 1,
      isBlocked: false,
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T01:00:00.000Z",
    },
    {
      id: "card-uuid-102",
      listId: "list-uuid-todo",
      boardId: "b-uuid-1",
      code: "NEX-102",
      title: "Blocked task 102",
      priority: "URGENT",
      position: 2048,
      status: "ACTIVE",
      statusGroup: "TODO",
      assignees: [],
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      isBlocked: true,
      blockReason: "Waiting for dependency NEX-101",
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T01:00:00.000Z",
    },
  ];

  const mockMembers: BoardMember[] = [
    {
      id: "user-uuid-pm",
      name: "Alice PM",
      initials: "AP",
      avatarUrl: "https://example.com/avatar.png",
      role: "PM",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(boardApi, "getBoard").mockResolvedValue(mockBoard);
    vi.spyOn(listApi, "getBoardLists").mockResolvedValue(mockLists);
    vi.spyOn(cardApi, "getBoardCards").mockResolvedValue(mockCards);
    vi.spyOn(boardApi, "getBoardMembers").mockResolvedValue(mockMembers);
    vi.spyOn(cardApi, "getCardTasks").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardAssignments").mockResolvedValue([]);
    vi.spyOn(cardApi, "getBoardLabels").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardLabels").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardComments").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardAttachments").mockResolvedValue([]);
    vi.spyOn(cardApi, "getCardById").mockImplementation(async (id) => {
      const card = mockCards.find((c) => c.id === id);
      return card ? { ...card } : mockCards[0];
    });
  });

  it("assembles live BoardDetail from parallel API reads with active lists partition", async () => {
    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(boardApi.getBoard).toHaveBeenCalledWith("b-uuid-1");
    expect(listApi.getBoardLists).toHaveBeenCalledWith("b-uuid-1", { includeArchived: true });
    expect(cardApi.getBoardCards).toHaveBeenCalledWith("b-uuid-1");
    expect(boardApi.getBoardMembers).toHaveBeenCalledWith("b-uuid-1");

    expect(result.current.error).toBeNull();
    const board = result.current.board;
    expect(board).toBeDefined();
    expect(board?.id).toBe("b-uuid-1");
    expect(board?.name).toBe("Engineering Kanban");
    expect(board?.status).toBe("ACTIVE");
    expect(board?.members).toEqual(mockMembers);

    // Active lists partition: only 2 active lists rendered
    expect(board?.lists).toHaveLength(2);
    expect(board?.lists.map((l) => l.id)).toEqual(["list-uuid-todo", "list-uuid-done"]);
    expect(board?.archivedListsCount).toBe(1);

    // Cards associated deterministically with active list
    const todoList = board?.lists.find((l) => l.id === "list-uuid-todo");
    expect(todoList?.cards).toHaveLength(2);
    expect(todoList?.cards[0].id).toBe("card-uuid-101");
    expect(todoList?.cards[1].id).toBe("card-uuid-102");
  });

  it("handles loading and error states when board fetch fails", async () => {
    vi.spyOn(boardApi, "getBoard").mockRejectedValueOnce(new Error("Board not found"));

    const { result } = renderHook(() => useBoardDetail("b-uuid-non-existent"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.board).toBeNull();
    expect(result.current.error).toBe("Board not found");
  });

  it("propagates error when member read fails instead of silently converting to empty array", async () => {
    vi.spyOn(boardApi, "getBoardMembers").mockRejectedValueOnce(new Error("Access forbidden"));

    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.board).toBeNull();
    expect(result.current.error).toBe("Access forbidden");
  });

  it("handles empty board state with no lists or cards gracefully", async () => {
    vi.spyOn(listApi, "getBoardLists").mockResolvedValueOnce([]);
    vi.spyOn(cardApi, "getBoardCards").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.board?.lists).toEqual([]);
    expect(result.current.board?.archivedListsCount).toBe(0);
    expect(result.current.allBoardCards).toEqual([]);
  });

  it("selects a card and derives selectedCard", async () => {
    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const card = result.current.board?.lists[0].cards[0];
    expect(card).toBeDefined();

    act(() => {
      result.current.handleSelectCard(card!);
    });

    expect(result.current.selectedCardId).toBe("card-uuid-101");
    expect(result.current.selectedCard?.title).toBe("Active task 101");

    act(() => {
      result.current.handleCloseCardDetail();
    });

    expect(result.current.selectedCardId).toBeNull();
    expect(result.current.selectedCard).toBeNull();
  });

  it("handles status change using moveCard and enforces prerequisite check for DONE", async () => {
    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const blockedCard = result.current.board?.lists[0].cards.find((c) => c.isBlocked);
    expect(blockedCard).toBeDefined();

    // Moving blocked card to DONE must be rejected
    let moved = false;
    await act(async () => {
      moved = await result.current.handleStatusChange(blockedCard!, "DONE");
    });
    expect(moved).toBe(false);

    // Moving non-blocked card to DONE succeeds
    const activeCard = result.current.board?.lists[0].cards.find((c) => !c.isBlocked);
    expect(activeCard).toBeDefined();

    const serverResponseCard: KanbanCard = {
      ...activeCard!,
      listId: "list-uuid-done",
      position: 1024,
      statusGroup: "DONE",
      updatedAt: "2026-10-09T02:00:00.000Z",
    };
    vi.spyOn(cardApi, "moveCard").mockResolvedValueOnce(serverResponseCard);

    await act(async () => {
      moved = await result.current.handleStatusChange(activeCard!, "DONE");
    });
    expect(moved).toBe(true);

    // Verify card moved to DONE list with updated server timestamp
    const doneCards = result.current.board?.lists.find((l) => l.id === "list-uuid-done")?.cards || [];
    expect(doneCards.some((c) => c.id === "card-uuid-101")).toBe(true);
  });

  it("enforces blocked card rejection in drag-and-drop handleCommitMoveCard", async () => {
    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const blockedCard = result.current.board?.lists[0].cards.find((c) => c.isBlocked);
    expect(blockedCard).toBeDefined();

    await act(async () => {
      await result.current.handleCommitMoveCard(blockedCard!.id, {
        targetListId: "list-uuid-done",
        position: 1024,
        updatedAt: blockedCard!.updatedAt,
      });
    });

    const doneCards = result.current.board?.lists.find((l) => l.id === "list-uuid-done")?.cards || [];
    expect(doneCards.some((c) => c.id === blockedCard!.id)).toBe(false);
  });

  it("handles handleAddCard by calling real cardApi.createCard and updating state", async () => {
    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newCreatedCard: KanbanCard = {
      id: "card-uuid-new",
      listId: "list-uuid-todo",
      boardId: "b-uuid-1",
      code: "NEX-103",
      title: "Newly created card",
      priority: "MEDIUM",
      position: 3072,
      status: "ACTIVE",
      statusGroup: "TODO",
      assignees: [],
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      createdAt: "2026-10-09T03:00:00.000Z",
      updatedAt: "2026-10-09T03:00:00.000Z",
    };

    vi.spyOn(cardApi, "createCard").mockResolvedValueOnce(newCreatedCard);

    await act(async () => {
      await result.current.handleAddCard("list-uuid-todo", "Newly created card");
    });

    expect(cardApi.createCard).toHaveBeenCalledWith("list-uuid-todo", {
      title: "Newly created card",
    });

    const todoCards = result.current.board?.lists.find((l) => l.id === "list-uuid-todo")?.cards || [];
    expect(todoCards.some((c) => c.id === "card-uuid-new")).toBe(true);
  });

  it("handles handleUpdateCard and reloads board on 409 CARD_CONFLICT", async () => {
    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.spyOn(cardApi, "updateCard").mockRejectedValueOnce(
      new Error("409 CARD_CONFLICT: Card was updated by another user")
    );

    const reloadSpy = vi.spyOn(boardApi, "getBoard");

    await act(async () => {
      await expect(
        result.current.handleUpdateCard("card-uuid-101", {
          title: "Conflicted title",
          updatedAt: "2020-01-01T00:00:00.000Z",
        })
      ).rejects.toThrow("CARD_CONFLICT");
    });

    // Verification: reload triggered to refresh stale state
    expect(reloadSpy).toHaveBeenCalled();
  });

  it("handles handleDeleteCard by removing card from state after successful deletion", async () => {
    const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.spyOn(cardApi, "deleteCard").mockResolvedValueOnce();

    // Select the card first
    act(() => {
      result.current.handleSelectCard(mockCards[0]);
    });
    expect(result.current.selectedCardId).toBe("card-uuid-101");

    await act(async () => {
      await result.current.handleDeleteCard("card-uuid-101");
    });

    expect(cardApi.deleteCard).toHaveBeenCalledWith("card-uuid-101");

    // Card should be removed from list
    const todoCards = result.current.board?.lists.find((l) => l.id === "list-uuid-todo")?.cards || [];
    expect(todoCards.some((c) => c.id === "card-uuid-101")).toBe(false);

    // Selected card drawer should be closed
    expect(result.current.selectedCardId).toBeNull();
  });

  describe("Tasks / Checklist Integration & Parent Card Reconciliation", () => {
    const mockTask1: ChecklistItem = {
      id: "task-uuid-1",
      cardId: "card-uuid-101",
      title: "Write integration tests",
      isCompleted: false,
      position: 1024,
      createdAt: "2026-10-09T01:00:00.000Z",
      updatedAt: "2026-10-09T01:00:00.000Z",
    };

    const mockTask2: ChecklistItem = {
      id: "task-uuid-2",
      cardId: "card-uuid-101",
      title: "Review checklist",
      isCompleted: true,
      position: 2048,
      createdAt: "2026-10-09T01:10:00.000Z",
      updatedAt: "2026-10-09T01:20:00.000Z",
    };

    it("loads checklist tasks when card is selected and protects against stale responses on rapid switch", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let resolveCard1Tasks!: (tasks: ChecklistItem[]) => void;
      const card1Promise = new Promise<ChecklistItem[]>((resolve) => {
        resolveCard1Tasks = resolve;
      });

      const card2Tasks: ChecklistItem[] = [
        {
          id: "task-uuid-card2",
          cardId: "card-uuid-102",
          title: "Card 2 Task",
          isCompleted: false,
          position: 1024,
        },
      ];

      vi.spyOn(cardApi, "getCardTasks").mockImplementation((cardId) => {
        if (cardId === "card-uuid-101") return card1Promise;
        if (cardId === "card-uuid-102") return Promise.resolve(card2Tasks);
        return Promise.resolve([]);
      });

      // 1. Select Card 101 -> in-flight
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      expect(result.current.selectedCardId).toBe("card-uuid-101");
      expect(result.current.isTasksLoading).toBe(true);

      // 2. Rapidly switch to Card 102 before Card 101 resolves
      await act(async () => {
        result.current.handleSelectCard(mockCards[1]);
      });

      // Card 102 should have resolved its tasks
      await waitFor(() => expect(result.current.isTasksLoading).toBe(false));
      expect(result.current.selectedCardId).toBe("card-uuid-102");
      expect(result.current.selectedCard?.checklist).toEqual(card2Tasks);

      // 3. Now Card 101's delayed response resolves:
      await act(async () => {
        resolveCard1Tasks([mockTask1, mockTask2]);
      });

      // Delayed response for Card 101 MUST NOT overwrite Card 102!
      expect(result.current.selectedCardId).toBe("card-uuid-102");
      expect(result.current.selectedCard?.checklist).toEqual(card2Tasks);
    });

    it("handles handleAddChecklistItem by adding task and reconciling parent card updatedAt and task counts", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(mockTask1);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: "2026-10-09T03:00:00.000Z", // Server bumped timestamp
        tasksCount: 3,
        completedTasksCount: 1,
      });

      await act(async () => {
        await result.current.handleAddChecklistItem("card-uuid-101", "Write integration tests");
      });

      expect(cardApi.addChecklistItem).toHaveBeenCalledWith("card-uuid-101", "Write integration tests");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      expect(cardInBoard).toBeDefined();
      expect(cardInBoard?.updatedAt).toBe("2026-10-09T03:00:00.000Z");
      expect(cardInBoard?.tasksCount).toBe(3);
      expect(cardInBoard?.checklist?.some((t) => t.id === "task-uuid-1")).toBe(true);
    });

    it("handles handleToggleChecklistItem by updating task and reconciling parent card", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Setup initial card with task
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([mockTask1]);
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.selectedCard?.checklist).toHaveLength(1));

      const updatedTask = { ...mockTask1, isCompleted: true, updatedAt: "2026-10-09T03:30:00.000Z" };
      vi.spyOn(cardApi, "updateChecklistItem").mockResolvedValueOnce(updatedTask);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: "2026-10-09T03:30:00.000Z",
        tasksCount: 1,
        completedTasksCount: 1,
      });

      await act(async () => {
        await result.current.handleToggleChecklistItem("card-uuid-101", "task-uuid-1", true);
      });

      expect(cardApi.updateChecklistItem).toHaveBeenCalledWith("task-uuid-1", { isCompleted: true });
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      expect(cardInBoard?.updatedAt).toBe("2026-10-09T03:30:00.000Z");
      expect(cardInBoard?.completedTasksCount).toBe(1);
      expect(cardInBoard?.checklist?.[0].isCompleted).toBe(true);
    });

    it("handles handleDeleteChecklistItem by removing task and reconciling parent card", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Setup initial card with task
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([mockTask1]);
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.selectedCard?.checklist).toHaveLength(1));

      vi.spyOn(cardApi, "deleteChecklistItem").mockResolvedValueOnce();
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: "2026-10-09T04:00:00.000Z",
        tasksCount: 0,
        completedTasksCount: 0,
      });

      await act(async () => {
        await result.current.handleDeleteChecklistItem("card-uuid-101", "task-uuid-1");
      });

      expect(cardApi.deleteChecklistItem).toHaveBeenCalledWith("task-uuid-1");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      expect(cardInBoard?.updatedAt).toBe("2026-10-09T04:00:00.000Z");
      expect(cardInBoard?.tasksCount).toBe(0);
      expect(cardInBoard?.checklist).toHaveLength(0);
    });

    it("separates mutation success from reconciliation failure", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(mockTask1);
      // Card refresh fails transiently
      vi.spyOn(cardApi, "getCardById").mockRejectedValueOnce(new Error("Network timeout"));

      await act(async () => {
        // Mutation should NOT throw because task creation succeeded
        await result.current.handleAddChecklistItem("card-uuid-101", "Write integration tests");
      });

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      // Task is preserved in local checklist
      expect(cardInBoard?.checklist?.some((t) => t.id === "task-uuid-1")).toBe(true);
    });

    it("ignores stale parent card refresh response if refreshedCard has older updatedAt", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Simulate a newer card state already in memory
      const newerTimestamp = "2026-10-09T05:00:00.000Z";
      const olderTimestamp = "2026-10-09T04:00:00.000Z";

      // Advance local card timestamp
      vi.spyOn(cardApi, "updateCard").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: newerTimestamp,
      });
      await act(async () => {
        await result.current.handleUpdateCard("card-uuid-101", {
          title: "Newer title",
          updatedAt: mockCards[0].updatedAt,
        });
      });

      // Now add a task where getCardById returns a stale older response
      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(mockTask1);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: olderTimestamp, // Stale!
        tasksCount: 1,
        completedTasksCount: 0,
      });

      await act(async () => {
        await result.current.handleAddChecklistItem("card-uuid-101", "Write integration tests");
      });

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      // Newer timestamp MUST be preserved and NOT overwritten by the stale response
      expect(cardInBoard?.updatedAt).toBe(newerTimestamp);
    });

    it("does not duplicate task item if already present in checklist", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(mockTask1);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: "2026-10-09T06:00:00.000Z",
        tasksCount: 1,
        completedTasksCount: 0,
      });

      // First add
      await act(async () => {
        await result.current.handleAddChecklistItem("card-uuid-101", "Write integration tests");
      });

      // Attempt second add with same task ID
      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(mockTask1);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: "2026-10-09T06:01:00.000Z",
        tasksCount: 1,
        completedTasksCount: 0,
      });

      await act(async () => {
        await result.current.handleAddChecklistItem("card-uuid-101", "Write integration tests");
      });

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      // Verify no duplicates
      const occurrences = cardInBoard?.checklist?.filter((t) => t.id === mockTask1.id) || [];
      expect(occurrences).toHaveLength(1);
    });

    it("handles handleRetryTasks by synchronizing tasks and parent card without full board reload", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Select Card 101
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.selectedCardId).toBe("card-uuid-101"));

      const latestTask: ChecklistItem = {
        id: "task-recovered",
        cardId: "card-uuid-101",
        title: "Recovered task",
        isCompleted: true,
        position: 1024,
      };

      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([latestTask]);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: "2026-10-09T08:00:00.000Z",
        tasksCount: 1,
        completedTasksCount: 1,
      });

      await act(async () => {
        result.current.handleRetryTasks();
      });

      await waitFor(() => expect(result.current.isTasksLoading).toBe(false));

      expect(cardApi.getCardTasks).toHaveBeenCalledWith("card-uuid-101");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      expect(cardInBoard?.updatedAt).toBe("2026-10-09T08:00:00.000Z");
      expect(cardInBoard?.checklist).toEqual([latestTask]);
      expect(result.current.tasksError).toBeNull();
    });

    it("sets tasksError on card sync failure and allows retry to recover parent card updatedAt", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Select Card 101
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.isTasksLoading).toBe(false));

      // 1. Task mutation succeeds, but card sync fails
      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(mockTask1);
      vi.spyOn(cardApi, "getCardById").mockRejectedValueOnce(new Error("Card sync network timeout"));

      await act(async () => {
        await result.current.handleAddChecklistItem("card-uuid-101", "Write integration tests");
      });

      // Task is preserved in local checklist
      let cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");
      expect(cardInBoard?.checklist?.some((t) => t.id === "task-uuid-1")).toBe(true);
      // tasksError is set so the UI displays the Retry banner
      expect(result.current.tasksError).toBe("Unable to sync latest card timestamp. Click Retry to sync.");

      // 2. User clicks Retry: recovering both tasks and parent card
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([mockTask1]);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: "2026-10-09T09:00:00.000Z", // Server timestamp recovered
        tasksCount: 1,
        completedTasksCount: 0,
      });

      await act(async () => {
        result.current.handleRetryTasks();
      });

      await waitFor(() => expect(result.current.isTasksLoading).toBe(false));

      cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      expect(cardInBoard?.updatedAt).toBe("2026-10-09T09:00:00.000Z");
      expect(result.current.tasksError).toBeNull();
    });

    it("does not allow an older response with identical updatedAt to overwrite newer tasks count", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const sharedTimestamp = "2026-10-09T10:00:00.000Z";

      // Card currently has 2 tasks in local state
      const taskA: ChecklistItem = { id: "t-a", cardId: "card-uuid-101", title: "Task A", isCompleted: false, position: 1024 };
      const taskB: ChecklistItem = { id: "t-b", cardId: "card-uuid-101", title: "Task B", isCompleted: false, position: 2048 };

      // Populate local card with 2 tasks and shared timestamp
      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(taskA);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: sharedTimestamp,
        tasksCount: 1,
        completedTasksCount: 0,
      });
      await act(async () => {
        await result.current.handleAddChecklistItem("card-uuid-101", "Task A");
      });

      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValueOnce(taskB);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: sharedTimestamp, // Same timestamp
        tasksCount: 2,
        completedTasksCount: 0,
      });
      await act(async () => {
        await result.current.handleAddChecklistItem("card-uuid-101", "Task B");
      });

      // An out-of-order response arrives that had identical updatedAt but older tasksCount (1)
      vi.spyOn(cardApi, "updateChecklistItem").mockResolvedValueOnce({ ...taskA, isCompleted: true });
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: sharedTimestamp, // Identical timestamp
        tasksCount: 1, // Stale count!
        completedTasksCount: 0,
      });

      await act(async () => {
        await result.current.handleToggleChecklistItem("card-uuid-101", "t-a", true);
      });

      const cardInBoard = result.current.board?.lists
        .find((l) => l.id === "list-uuid-todo")
        ?.cards.find((c) => c.id === "card-uuid-101");

      // Verify tasksCount is NOT clobbered back to 1
      expect(cardInBoard?.tasksCount).toBe(2);
      expect(cardInBoard?.checklist).toHaveLength(2);
    });
  });

  describe("Card Assignments Integration & Concurrency Orchestration", () => {
    const mockAssignment: CardAssignmentDto = {
      id: "asgn-uuid-1",
      cardId: "card-uuid-101",
      userId: "user-uuid-pm",
      assignedAt: "2026-10-09T00:00:00.000Z",
      user: {
        id: "user-uuid-pm",
        fullName: "Alice PM",
        email: "alice@example.com",
      },
    };

    it("loads card assignments when card is selected and protects against stale responses on rapid switch", async () => {
      let resolveFirstAssignments!: (val: CardAssignmentDto[]) => void;
      const delayedFirstAssignmentsPromise = new Promise<CardAssignmentDto[]>((res) => {
        resolveFirstAssignments = res;
      });

      vi.spyOn(cardApi, "getCardAssignments").mockImplementation(async (cardId) => {
        if (cardId === "card-uuid-101") {
          return delayedFirstAssignmentsPromise;
        }
        return [
          {
            id: "asgn-uuid-2",
            cardId: "card-uuid-102",
            userId: "user-uuid-pm",
            assignedAt: "2026-10-09T02:00:00.000Z",
            user: {
              id: "user-uuid-pm",
              fullName: "Alice PM",
              email: "alice@example.com",
            },
          },
        ];
      });

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Select Card 101 -> assignments request is pending
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      expect(result.current.isAssignmentsLoading).toBe(true);

      // Rapid switch: Select Card 102 before 101 resolves
      act(() => {
        result.current.handleSelectCard(mockCards[1]);
      });

      await waitFor(() => {
        expect(result.current.isAssignmentsLoading).toBe(false);
      });

      // Delayed response for Card 101 now arrives
      await act(async () => {
        resolveFirstAssignments([mockAssignment]);
      });

      // Active card 102 must have its own assignment
      const activeCard = result.current.selectedCard;
      expect(activeCard?.id).toBe("card-uuid-102");
      expect(activeCard?.assignees).toHaveLength(1);
      expect(activeCard?.assignees[0].id).toBe("user-uuid-pm");

      // Card 101 in board lists must NOT have been tainted by the stale late response
      const card101 = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card101?.assignees).toHaveLength(0);
    });

    it("assigns member successfully, updates local state without duplicates, and reconciles parent card timestamp", async () => {
      const bumpedTime = "2026-10-09T03:00:00.000Z";
      vi.spyOn(cardApi, "assignCardMember").mockResolvedValueOnce({
        id: "asgn-new-1",
        cardId: "card-uuid-101",
        userId: "user-uuid-pm",
        assignedAt: bumpedTime,
      });
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: bumpedTime,
      });

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleAssignMember("card-uuid-101", "user-uuid-pm");
      });

      expect(cardApi.assignCardMember).toHaveBeenCalledWith("card-uuid-101", "user-uuid-pm");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");

      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.assignees).toHaveLength(1);
      expect(card?.assignees[0].id).toBe("user-uuid-pm");
      expect(card?.assignees[0].name).toBe("Alice PM");
      expect(card?.updatedAt).toBe(bumpedTime);
    });

    it("duplicate assignment does not produce duplicate assignees in state and handles 409 gracefully", async () => {
      const err = new Error("Assignment exists");
      (err as unknown as { code: string; status: number }).code = "ASSIGNMENT_EXISTS";
      (err as unknown as { code: string; status: number }).status = 409;
      vi.spyOn(cardApi, "assignCardMember").mockRejectedValueOnce(err);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.handleAssignMember("card-uuid-101", "user-uuid-pm");
        })
      ).rejects.toThrow("Assignment exists");

      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.assignees).toHaveLength(0);
    });

    it("unassigns member successfully, removes from local state, and reconciles parent card timestamp", async () => {
      const bumpedTime = "2026-10-09T04:00:00.000Z";
      // First populate card with an assignee
      vi.spyOn(cardApi, "getCardAssignments").mockResolvedValueOnce([mockAssignment]);
      vi.spyOn(cardApi, "unassignCardMember").mockResolvedValueOnce(undefined);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: bumpedTime,
      });

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => {
        expect(result.current.selectedCard?.assignees).toHaveLength(1);
      });

      await act(async () => {
        await result.current.handleUnassignMember("card-uuid-101", "user-uuid-pm");
      });

      expect(cardApi.unassignCardMember).toHaveBeenCalledWith("card-uuid-101", "user-uuid-pm");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");

      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.assignees).toHaveLength(0);
      expect(card?.updatedAt).toBe(bumpedTime);
    });

    it("mutation failure does not alter local state and preserves existing assignments", async () => {
      vi.spyOn(cardApi, "assignCardMember").mockRejectedValueOnce(new Error("403 Forbidden"));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.handleAssignMember("card-uuid-101", "user-uuid-pm");
        })
      ).rejects.toThrow("403 Forbidden");

      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.assignees).toHaveLength(0);
    });

    it("mutation succeeds but timestamp reconciliation fails: keeps assigned state and sets assignmentsError with warning", async () => {
      vi.spyOn(cardApi, "assignCardMember").mockResolvedValueOnce({
        id: "asgn-1",
        cardId: "card-uuid-101",
        userId: "user-uuid-pm",
        assignedAt: "2026-10-09T05:00:00.000Z",
      });
      vi.spyOn(cardApi, "getCardById").mockRejectedValueOnce(new Error("Network timeout"));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleAssignMember("card-uuid-101", "user-uuid-pm");
      });

      // Member is KEPT in local state (no rollback)
      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.assignees).toHaveLength(1);
      expect(card?.assignees[0].id).toBe("user-uuid-pm");

      // Separate error state set for reconciliation
      expect(result.current.assignmentsError).toBe("Unable to sync latest card timestamp. Click Retry to sync.");
    });

    it("retry assignments re-fetches assignments and reconciles card without calling POST/DELETE", async () => {
      const refreshedTime = "2026-10-09T06:00:00.000Z";
      vi.spyOn(cardApi, "getCardAssignments").mockResolvedValue([mockAssignment]);
      vi.spyOn(cardApi, "getCardById").mockResolvedValue({
        ...mockCards[0],
        updatedAt: refreshedTime,
      });
      const assignSpy = vi.spyOn(cardApi, "assignCardMember");
      const unassignSpy = vi.spyOn(cardApi, "unassignCardMember");

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.isAssignmentsLoading).toBe(false));

      await act(async () => {
        await result.current.handleRetryAssignments();
      });

      expect(cardApi.getCardAssignments).toHaveBeenCalledWith("card-uuid-101");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");
      expect(assignSpy).not.toHaveBeenCalled();
      expect(unassignSpy).not.toHaveBeenCalled();
      expect(result.current.assignmentsError).toBeNull();
    });

    it("stale parent card timestamp response does not overwrite newer updatedAt during assignment reconciliation", async () => {
      const newerTimestamp = "2026-10-09T08:00:00.000Z";
      const staleTimestamp = "2026-10-09T07:00:00.000Z";

      vi.spyOn(cardApi, "assignCardMember").mockResolvedValueOnce({
        id: "asgn-1",
        cardId: "card-uuid-101",
        userId: "user-uuid-pm",
        assignedAt: newerTimestamp,
      });
      // Initial card has newer timestamp
      vi.spyOn(cardApi, "getBoardCards").mockResolvedValueOnce([
        { ...mockCards[0], updatedAt: newerTimestamp },
        mockCards[1],
      ]);
      // Authoritative card fetch returns stale timestamp
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: staleTimestamp,
      });

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleAssignMember("card-uuid-101", "user-uuid-pm");
      });

      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      // Timestamp must remain the newer one
      expect(card?.updatedAt).toBe(newerTimestamp);
    });

    it("closing drawer resets assignments loading and error state and aborts active ref", async () => {
      vi.spyOn(cardApi, "getCardAssignments").mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      expect(result.current.isAssignmentsLoading).toBe(true);

      act(() => {
        result.current.handleCloseCardDetail();
      });
      expect(result.current.isAssignmentsLoading).toBe(false);
      expect(result.current.assignmentsError).toBeNull();
    });

    it("assignment error state is completely independent from tasks error state", async () => {
      // Assignments fail, tasks succeed
      vi.spyOn(cardApi, "getCardAssignments").mockRejectedValueOnce(new Error("Assignments service down"));
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([
        { id: "t-1", cardId: "card-uuid-101", title: "Task 1", isCompleted: true, position: 1024 },
      ]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.isAssignmentsLoading).toBe(false);
        expect(result.current.isTasksLoading).toBe(false);
      });

      expect(result.current.assignmentsError).toBe("Assignments service down");
      expect(result.current.tasksError).toBeNull();

      // Tasks checklist still successfully populated
      const card = result.current.selectedCard;
      expect(card?.checklist).toHaveLength(1);
    });
  });

  describe("Card Labels Suite", () => {
    const mockBoardLabel: BoardLabel = {
      id: "label-uuid-1",
      boardId: "b-uuid-1",
      name: "Bug",
      color: "#ef4444",
    };

    it("board loading populates board.labels from cardApi.getBoardLabels", async () => {
      vi.spyOn(cardApi, "getBoardLabels").mockResolvedValueOnce([mockBoardLabel]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(cardApi.getBoardLabels).toHaveBeenCalledWith("b-uuid-1");
      expect(result.current.board?.labels).toEqual([mockBoardLabel]);
    });

    it("selecting a card fetches card labels via cardApi.getCardLabels and populates card.labels", async () => {
      vi.spyOn(cardApi, "getCardLabels").mockResolvedValueOnce([mockBoardLabel]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => expect(result.current.isLabelsLoading).toBe(false));

      expect(cardApi.getCardLabels).toHaveBeenCalledWith("card-uuid-101");
      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.labels).toEqual([mockBoardLabel]);
    });

    it("stale card labels response is discarded if active card changed before request completed", async () => {
      let resolveFirstCardLabels: (labels: BoardLabel[]) => void = () => {};
      const firstPromise = new Promise<BoardLabel[]>((resolve) => {
        resolveFirstCardLabels = resolve;
      });

      vi.spyOn(cardApi, "getCardLabels").mockImplementation((cardId) => {
        if (cardId === "card-uuid-101") return firstPromise;
        return Promise.resolve([{ id: "label-uuid-2", boardId: "b-uuid-1", name: "Feature" }]);
      });

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Select Card 101
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      expect(result.current.isLabelsLoading).toBe(true);

      // Fast-switch to Card 102
      act(() => {
        result.current.handleSelectCard(mockCards[1]);
      });

      // Card 101 resolves late
      await act(async () => {
        resolveFirstCardLabels([mockBoardLabel]);
      });

      await waitFor(() => expect(result.current.isLabelsLoading).toBe(false));

      // Selected card (102) must NOT have Card 101's label
      const card102 = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-102");
      expect(card102?.labels.some((l) => l.id === "label-uuid-1")).toBe(false);
      expect(card102?.labels).toEqual([{ id: "label-uuid-2", boardId: "b-uuid-1", name: "Feature" }]);
    });

    it("handleAttachCardLabel updates card.labels and reconciles parent card timestamp", async () => {
      const refreshedTime = "2026-10-09T03:00:00.000Z";
      vi.spyOn(cardApi, "attachCardLabel").mockResolvedValueOnce(mockBoardLabel);
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: refreshedTime,
      });

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleAttachCardLabel("card-uuid-101", "label-uuid-1");
      });

      expect(cardApi.attachCardLabel).toHaveBeenCalledWith("card-uuid-101", "label-uuid-1");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");

      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.labels).toEqual([mockBoardLabel]);
      expect(card?.updatedAt).toBe(refreshedTime);
    });

    it("handleDetachCardLabel removes label from card.labels and reconciles timestamp", async () => {
      const refreshedTime = "2026-10-09T04:00:00.000Z";
      vi.spyOn(cardApi, "getCardLabels").mockResolvedValueOnce([mockBoardLabel]);
      vi.spyOn(cardApi, "detachCardLabel").mockResolvedValueOnce();
      vi.spyOn(cardApi, "getCardById").mockResolvedValueOnce({
        ...mockCards[0],
        updatedAt: refreshedTime,
      });

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.isLabelsLoading).toBe(false));

      await act(async () => {
        await result.current.handleDetachCardLabel("card-uuid-101", "label-uuid-1");
      });

      expect(cardApi.detachCardLabel).toHaveBeenCalledWith("card-uuid-101", "label-uuid-1");
      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      expect(card?.labels).toEqual([]);
      expect(card?.updatedAt).toBe(refreshedTime);
    });

    it("duplicate attachment (409 CARD_LABEL_EXISTS) reloads labels without corrupting state", async () => {
      const conflictError = Object.assign(new Error("Label đã được gắn vào Card"), {
        code: "CARD_LABEL_EXISTS",
        status: 409,
      });
      vi.spyOn(cardApi, "attachCardLabel").mockRejectedValueOnce(conflictError);
      const getCardLabelsSpy = vi.spyOn(cardApi, "getCardLabels").mockResolvedValueOnce([mockBoardLabel]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        try {
          await result.current.handleAttachCardLabel("card-uuid-101", "label-uuid-1");
        } catch {
          // Expected to throw
        }
      });

      expect(getCardLabelsSpy).toHaveBeenCalledWith("card-uuid-101");
    });

    it("label mutation succeeds but timestamp reconciliation fails: preserves local label state and sets labelsError", async () => {
      vi.spyOn(cardApi, "attachCardLabel").mockResolvedValueOnce(mockBoardLabel);
      vi.spyOn(cardApi, "getCardById").mockRejectedValueOnce(new Error("Network timeout"));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.handleAttachCardLabel("card-uuid-101", "label-uuid-1");
      });

      const card = result.current.board?.lists
        .flatMap((l) => l.cards)
        .find((c) => c.id === "card-uuid-101");
      // Label is kept in state
      expect(card?.labels).toEqual([mockBoardLabel]);
      expect(result.current.labelsError).toBe("Unable to sync latest card timestamp. Click Retry to sync.");
      // Assignments error remains null
      expect(result.current.assignmentsError).toBeNull();
    });

    it("retry labels re-fetches labels and reconciles card without calling attach/detach", async () => {
      const refreshedTime = "2026-10-09T05:00:00.000Z";
      vi.spyOn(cardApi, "getCardLabels").mockResolvedValue([mockBoardLabel]);
      vi.spyOn(cardApi, "getCardById").mockResolvedValue({
        ...mockCards[0],
        updatedAt: refreshedTime,
      });
      const attachSpy = vi.spyOn(cardApi, "attachCardLabel");
      const detachSpy = vi.spyOn(cardApi, "detachCardLabel");

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.isLabelsLoading).toBe(false));

      await act(async () => {
        await result.current.handleRetryLabels();
      });

      expect(cardApi.getCardLabels).toHaveBeenCalledWith("card-uuid-101");
      expect(cardApi.getCardById).toHaveBeenCalledWith("card-uuid-101");
      expect(attachSpy).not.toHaveBeenCalled();
      expect(detachSpy).not.toHaveBeenCalled();
      expect(result.current.labelsError).toBeNull();
    });

    it("label errors remain independent from tasks and assignments errors", async () => {
      vi.spyOn(cardApi, "getCardLabels").mockRejectedValueOnce(new Error("Labels failed"));
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([
        { id: "t-1", cardId: "card-uuid-101", title: "Task 1", isCompleted: false, position: 1 },
      ]);
      vi.spyOn(cardApi, "getCardAssignments").mockResolvedValueOnce([]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.isLabelsLoading).toBe(false);
        expect(result.current.isTasksLoading).toBe(false);
      });

      expect(result.current.labelsError).toBe("Labels failed");
      expect(result.current.tasksError).toBeNull();
      expect(result.current.assignmentsError).toBeNull();
    });

    it("closing drawer resets label loading and error states", () => {
      vi.spyOn(cardApi, "getCardLabels").mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      expect(result.current.isLabelsLoading).toBe(true);

      act(() => {
        result.current.handleCloseCardDetail();
      });
      expect(result.current.isLabelsLoading).toBe(false);
      expect(result.current.labelsError).toBeNull();
    });
  });

  describe("Card Comments Suite (Step 6E)", () => {
    const mockCommentDto1 = {
      id: "comment-uuid-1",
      cardId: "card-uuid-101",
      userId: "user-uuid-pm",
      content: "Hello team, please review this implementation.",
      createdAt: "2026-10-10T09:00:00.000Z",
      updatedAt: "2026-10-10T09:00:00.000Z",
      deletedAt: null,
    };

    const mockCommentDto2 = {
      id: "comment-uuid-2",
      cardId: "card-uuid-101",
      userId: "user-uuid-unknown",
      content: null,
      createdAt: "2026-10-10T09:30:00.000Z",
      updatedAt: "2026-10-10T09:35:00.000Z",
      deletedAt: "2026-10-10T09:35:00.000Z",
    };

    it("auto-loads comments when card is selected and maps members from board", async () => {
      vi.spyOn(cardApi, "getCardComments").mockResolvedValueOnce([mockCommentDto1, mockCommentDto2]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.isCommentsLoading).toBe(false);
      });

      const selectedCard = result.current.selectedCard;
      expect(selectedCard).toBeDefined();
      expect(selectedCard?.comments).toHaveLength(2);
      expect(selectedCard?.comments?.[0].author.name).toBe("Alice PM");
      expect(selectedCard?.comments?.[0].content).toBe("Hello team, please review this implementation.");
      expect(selectedCard?.comments?.[1].author.name).toBe("Unknown Member");
      expect(selectedCard?.comments?.[1].isDeleted).toBe(true);
      expect(selectedCard?.comments?.[1].content).toBeNull();
    });

    it("stale response guard: previous card response does not overwrite current card", async () => {
      let resolveCard1!: (val: typeof mockCommentDto1[]) => void;
      const card1Promise = new Promise<typeof mockCommentDto1[]>((resolve) => {
        resolveCard1 = resolve;
      });

      vi.spyOn(cardApi, "getCardComments")
        .mockReturnValueOnce(card1Promise)
        .mockResolvedValueOnce([mockCommentDto2]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Select Card 1
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      // Rapidly switch to Card 2
      act(() => {
        result.current.handleSelectCard(mockCards[1]);
      });

      await waitFor(() => {
        expect(result.current.selectedCardId).toBe(mockCards[1].id);
        expect(result.current.isCommentsLoading).toBe(false);
      });

      // Late resolution of Card 1
      act(() => {
        resolveCard1([mockCommentDto1]);
      });

      // Card 2's comments must remain mockCommentDto2
      expect(result.current.selectedCard?.id).toBe(mockCards[1].id);
      expect(result.current.selectedCard?.comments?.[0].id).toBe("comment-uuid-2");
    });

    it("closing drawer resets comment loading and error states", () => {
      vi.spyOn(cardApi, "getCardComments").mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      expect(result.current.isCommentsLoading).toBe(true);

      act(() => {
        result.current.handleCloseCardDetail();
      });
      expect(result.current.isCommentsLoading).toBe(false);
      expect(result.current.commentsError).toBeNull();
    });

    it("handleAddComment creates a comment, appends to card, and does not alter card.updatedAt", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      const initialUpdatedAt = result.current.selectedCard?.updatedAt;

      vi.spyOn(cardApi, "createCardComment").mockResolvedValueOnce(mockCommentDto1);

      await act(async () => {
        await result.current.handleAddComment(mockCards[0].id, "Hello team, please review this implementation.");
      });

      expect(cardApi.createCardComment).toHaveBeenCalledWith(
        mockCards[0].id,
        "Hello team, please review this implementation."
      );

      const updatedCard = result.current.selectedCard;
      expect(updatedCard?.comments).toHaveLength(1);
      expect(updatedCard?.comments?.[0].id).toBe("comment-uuid-1");
      expect(updatedCard?.updatedAt).toBe(initialUpdatedAt);
    });

    it("handleAddComment throws on validation/mention error and shows toast", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      const error = { code: "MENTION_INVALID", message: "Mentioned user not in board" };
      vi.spyOn(cardApi, "createCardComment").mockRejectedValueOnce(error);

      await expect(
        act(async () => {
          await result.current.handleAddComment(mockCards[0].id, "@unknown-user");
        })
      ).rejects.toEqual(error);
    });

    it("handleUpdateComment updates comment content and does not alter card.updatedAt", async () => {
      vi.spyOn(cardApi, "getCardComments").mockResolvedValueOnce([mockCommentDto1]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.isCommentsLoading).toBe(false));

      const updatedDto = {
        ...mockCommentDto1,
        content: "Edited remark content",
        updatedAt: "2026-10-10T10:00:00.000Z",
      };
      vi.spyOn(cardApi, "updateCardComment").mockResolvedValueOnce(updatedDto);

      const initialCardUpdatedAt = result.current.selectedCard?.updatedAt;

      await act(async () => {
        await result.current.handleUpdateComment("comment-uuid-1", "Edited remark content");
      });

      expect(cardApi.updateCardComment).toHaveBeenCalledWith("comment-uuid-1", "Edited remark content");
      expect(result.current.selectedCard?.comments?.[0].content).toBe("Edited remark content");
      expect(result.current.selectedCard?.updatedAt).toBe(initialCardUpdatedAt);
    });

    it("handleDeleteComment marks comment as soft-deleted without altering card.updatedAt", async () => {
      vi.spyOn(cardApi, "getCardComments").mockResolvedValueOnce([mockCommentDto1]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.isCommentsLoading).toBe(false));

      vi.spyOn(cardApi, "deleteCardComment").mockResolvedValueOnce();

      const initialCardUpdatedAt = result.current.selectedCard?.updatedAt;

      await act(async () => {
        await result.current.handleDeleteComment("comment-uuid-1");
      });

      expect(cardApi.deleteCardComment).toHaveBeenCalledWith("comment-uuid-1");
      expect(result.current.selectedCard?.comments?.[0].isDeleted).toBe(true);
      expect(result.current.selectedCard?.comments?.[0].content).toBeNull();
      expect(result.current.selectedCard?.updatedAt).toBe(initialCardUpdatedAt);
    });

    it("handleRetryComments only calls GET to reload comments, never replays mutations", async () => {
      vi.spyOn(cardApi, "getCardComments")
        .mockRejectedValueOnce(new Error("Network failed"))
        .mockResolvedValueOnce([mockCommentDto1]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.commentsError).toBe("Network failed");
      });

      act(() => {
        result.current.handleRetryComments();
      });

      await waitFor(() => {
        expect(result.current.commentsError).toBeNull();
        expect(result.current.selectedCard?.comments).toHaveLength(1);
      });

      expect(cardApi.getCardComments).toHaveBeenCalledTimes(2);
    });

    it("comments failure is isolated and does not break tasks, assignments or labels", async () => {
      vi.spyOn(cardApi, "getCardComments").mockRejectedValueOnce(new Error("Comments server timeout"));
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([]);
      vi.spyOn(cardApi, "getCardAssignments").mockResolvedValueOnce([]);
      vi.spyOn(cardApi, "getCardLabels").mockResolvedValueOnce([]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.isCommentsLoading).toBe(false);
      });

      expect(result.current.commentsError).toBe("Comments server timeout");
      expect(result.current.tasksError).toBeNull();
      expect(result.current.assignmentsError).toBeNull();
      expect(result.current.labelsError).toBeNull();
      expect(result.current.selectedCard?.id).toBe(mockCards[0].id);
    });
  });

  describe("Card Attachments Suite (Step 6F)", () => {
    const mockAttachmentDto1 = {
      id: "att-uuid-1",
      cardId: "card-uuid-101",
      userId: "user-uuid-pm",
      fileName: "architecture_spec.pdf",
      fileSize: 1048576,
      mimeType: "application/pdf",
      createdAt: "2026-10-10T09:00:00.000Z",
    };

    const mockAttachmentDto2 = {
      id: "att-uuid-2",
      cardId: "card-uuid-101",
      userId: "user-uuid-unknown",
      fileName: "screenshot.png",
      fileSize: 524288,
      mimeType: "image/png",
      createdAt: "2026-10-10T09:30:00.000Z",
    };

    it("auto-loads attachments when card is selected and maps members from board", async () => {
      vi.spyOn(cardApi, "getCardAttachments").mockResolvedValueOnce([mockAttachmentDto1, mockAttachmentDto2]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.isAttachmentsLoading).toBe(false);
      });

      const selectedCard = result.current.selectedCard;
      expect(selectedCard).toBeDefined();
      expect(selectedCard?.attachments).toHaveLength(2);
      expect(selectedCard?.attachments?.[0].uploadedBy.name).toBe("Alice PM");
      expect(selectedCard?.attachments?.[0].fileName).toBe("architecture_spec.pdf");
      expect(selectedCard?.attachments?.[1].uploadedBy.name).toBe("Unknown Member");
      expect(selectedCard?.attachments?.[1].fileSize).toBe(524288);
    });

    it("stale response guard: previous card response does not overwrite current card", async () => {
      let resolveCard1!: (val: typeof mockAttachmentDto1[]) => void;
      const card1Promise = new Promise<typeof mockAttachmentDto1[]>((resolve) => {
        resolveCard1 = resolve;
      });

      vi.spyOn(cardApi, "getCardAttachments")
        .mockReturnValueOnce(card1Promise)
        .mockResolvedValueOnce([mockAttachmentDto2]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Select Card 1
      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      // Rapidly switch to Card 2
      act(() => {
        result.current.handleSelectCard(mockCards[1]);
      });

      await waitFor(() => {
        expect(result.current.selectedCardId).toBe(mockCards[1].id);
        expect(result.current.isAttachmentsLoading).toBe(false);
      });

      // Late resolution of Card 1
      act(() => {
        resolveCard1([mockAttachmentDto1]);
      });

      // Card 2's attachments must remain mockAttachmentDto2
      expect(result.current.selectedCard?.id).toBe(mockCards[1].id);
      expect(result.current.selectedCard?.attachments?.[0].id).toBe("att-uuid-2");
    });

    it("closing drawer resets attachment loading and error states", () => {
      vi.spyOn(cardApi, "getCardAttachments").mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      expect(result.current.isAttachmentsLoading).toBe(true);

      act(() => {
        result.current.handleCloseCardDetail();
      });
      expect(result.current.isAttachmentsLoading).toBe(false);
      expect(result.current.attachmentsError).toBeNull();
    });

    it("handleUploadAttachment uploads file, appends to card, and does not alter card.updatedAt", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      const initialUpdatedAt = result.current.selectedCard?.updatedAt;
      const testFile = new File(["sample"], "architecture_spec.pdf", { type: "application/pdf" });

      vi.spyOn(cardApi, "uploadCardAttachment").mockResolvedValueOnce(mockAttachmentDto1);

      await act(async () => {
        await result.current.handleUploadAttachment(mockCards[0].id, testFile);
      });

      expect(cardApi.uploadCardAttachment).toHaveBeenCalledWith(mockCards[0].id, testFile);

      const updatedCard = result.current.selectedCard;
      expect(updatedCard?.attachments).toHaveLength(1);
      expect(updatedCard?.attachments?.[0].id).toBe("att-uuid-1");
      expect(updatedCard?.updatedAt).toBe(initialUpdatedAt);
    });

    it("handleUploadAttachment throws on error and triggers toast", async () => {
      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      const error = { code: "PAYLOAD_TOO_LARGE", message: "File exceeds 25MB" };
      vi.spyOn(cardApi, "uploadCardAttachment").mockRejectedValueOnce(error);

      const testFile = new File(["huge"], "huge.pdf", { type: "application/pdf" });

      await expect(
        act(async () => {
          await result.current.handleUploadAttachment(mockCards[0].id, testFile);
        })
      ).rejects.toEqual(error);
    });

    it("handleDeleteAttachment deletes attachment, removes from card, and does not alter card.updatedAt", async () => {
      vi.spyOn(cardApi, "getCardAttachments").mockResolvedValueOnce([mockAttachmentDto1]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });
      await waitFor(() => expect(result.current.isAttachmentsLoading).toBe(false));

      vi.spyOn(cardApi, "deleteCardAttachment").mockResolvedValueOnce();

      const initialCardUpdatedAt = result.current.selectedCard?.updatedAt;

      await act(async () => {
        await result.current.handleDeleteAttachment("att-uuid-1");
      });

      expect(cardApi.deleteCardAttachment).toHaveBeenCalledWith("att-uuid-1");
      expect(result.current.selectedCard?.attachments).toHaveLength(0);
      expect(result.current.selectedCard?.updatedAt).toBe(initialCardUpdatedAt);
    });

    it("handleDownloadAttachment calls API and returns Blob", async () => {
      const mockBlob = new Blob(["test"], { type: "application/pdf" });
      vi.spyOn(cardApi, "downloadCardAttachment").mockResolvedValueOnce(mockBlob);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));

      let blobResult!: Blob;
      await act(async () => {
        blobResult = await result.current.handleDownloadAttachment("att-uuid-1");
      });

      expect(cardApi.downloadCardAttachment).toHaveBeenCalledWith("att-uuid-1");
      expect(blobResult).toBe(mockBlob);
    });

    it("handleRetryAttachments only calls GET to reload attachments", async () => {
      vi.spyOn(cardApi, "getCardAttachments")
        .mockRejectedValueOnce(new Error("Network failed"))
        .mockResolvedValueOnce([mockAttachmentDto1]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.attachmentsError).toBe("Network failed");
      });

      act(() => {
        result.current.handleRetryAttachments();
      });

      await waitFor(() => {
        expect(result.current.attachmentsError).toBeNull();
        expect(result.current.selectedCard?.attachments).toHaveLength(1);
      });

      expect(cardApi.getCardAttachments).toHaveBeenCalledTimes(2);
    });

    it("attachments failure is isolated and does not break tasks, assignments, labels, or comments", async () => {
      vi.spyOn(cardApi, "getCardAttachments").mockRejectedValueOnce(new Error("Attachments server timeout"));
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValueOnce([]);
      vi.spyOn(cardApi, "getCardAssignments").mockResolvedValueOnce([]);
      vi.spyOn(cardApi, "getCardLabels").mockResolvedValueOnce([]);
      vi.spyOn(cardApi, "getCardComments").mockResolvedValueOnce([]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.isAttachmentsLoading).toBe(false);
      });

      expect(result.current.attachmentsError).toBe("Attachments server timeout");
      expect(result.current.tasksError).toBeNull();
      expect(result.current.assignmentsError).toBeNull();
      expect(result.current.labelsError).toBeNull();
      expect(result.current.commentsError).toBeNull();
      expect(result.current.selectedCard?.id).toBe(mockCards[0].id);
    });
  });

  describe("Card Dependencies Suite (Task A)", () => {
    const mockDependency = {
      id: "dep-uuid-1",
      cardId: "card-uuid-101",
      prerequisiteCardId: "c-uuid-2",
      prerequisiteCode: "NEX-2",
      prerequisiteTitle: "Prerequisite Task",
      prerequisiteStatus: "TODO" as const,
      isCompleted: false,
    };

    it("loads dependencies when card is selected and populates card.dependencies", async () => {
      vi.spyOn(cardApi, "getCardDependencies").mockResolvedValueOnce([mockDependency]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.isDependenciesLoading).toBe(false);
      });

      expect(cardApi.getCardDependencies).toHaveBeenCalledWith(mockCards[0].id);
      expect(result.current.selectedCard?.dependencies).toEqual([mockDependency]);
      expect(result.current.dependenciesError).toBeNull();
    });

    it("handleRetryDependencies re-calls getCardDependencies", async () => {
      vi.spyOn(cardApi, "getCardDependencies")
        .mockRejectedValueOnce(new Error("Dependencies network failure"))
        .mockResolvedValueOnce([mockDependency]);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.dependenciesError).toBe("Dependencies network failure");
      });

      act(() => {
        result.current.handleRetryDependencies();
      });

      await waitFor(() => {
        expect(result.current.dependenciesError).toBeNull();
        expect(result.current.selectedCard?.dependencies).toEqual([mockDependency]);
      });

      expect(cardApi.getCardDependencies).toHaveBeenCalledTimes(2);
    });

    it("handleAddDependency adds dependency to card state", async () => {
      vi.spyOn(cardApi, "getCardDependencies").mockResolvedValue([]);
      vi.spyOn(cardApi, "addDependency").mockResolvedValueOnce(mockDependency);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => expect(result.current.isDependenciesLoading).toBe(false));

      await act(async () => {
        await result.current.handleAddDependency(mockCards[0].id, "c-uuid-2");
      });

      expect(cardApi.addDependency).toHaveBeenCalledWith(mockCards[0].id, {
        dependsOnCardId: "c-uuid-2",
      });
      expect(result.current.selectedCard?.dependencies).toEqual([mockDependency]);
    });

    it("handleDeleteDependency removes dependency from card state", async () => {
      vi.spyOn(cardApi, "getCardDependencies").mockResolvedValue([mockDependency]);
      vi.spyOn(cardApi, "deleteDependency").mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => expect(result.current.isDependenciesLoading).toBe(false));

      await act(async () => {
        await result.current.handleDeleteDependency(mockCards[0].id, "dep-uuid-1");
      });

      expect(cardApi.deleteDependency).toHaveBeenCalledWith(mockCards[0].id, "dep-uuid-1");
      expect(result.current.selectedCard?.dependencies).toHaveLength(0);
    });

    it("closing drawer resets dependencies loading and error states", async () => {
      vi.spyOn(cardApi, "getCardDependencies").mockRejectedValueOnce(new Error("Failed"));

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => {
        result.current.handleSelectCard(mockCards[0]);
      });

      await waitFor(() => {
        expect(result.current.dependenciesError).toBe("Failed");
      });

      act(() => {
        result.current.handleCloseCardDetail();
      });

      expect(result.current.isDependenciesLoading).toBe(false);
      expect(result.current.dependenciesError).toBeNull();
    });
  });

  describe("Card Activities Suite (Task B)", () => {
    it("fetchCardActivities delegates to cardApi.getCardActivities with cursor and members pool", async () => {
      const mockResult = {
        items: [
          {
            id: "act-1",
            cardId: "c-uuid-1",
            user: { id: "m-1", name: "Member 1", initials: "M1", role: "MEMBER" as const },
            action: "created this card",
            createdAt: "2026-10-10T10:00:00.000Z",
          },
        ],
        nextCursor: "next-cursor-123",
      };

      vi.spyOn(cardApi, "getCardActivities").mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useBoardDetail("b-uuid-1"));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let activitiesResult: unknown;
      await act(async () => {
        activitiesResult = await result.current.fetchCardActivities("c-uuid-1", "cursor-token");
      });

      expect(cardApi.getCardActivities).toHaveBeenCalledWith(
        "c-uuid-1",
        { cursor: "cursor-token", limit: 20 },
        expect.any(Array)
      );
      expect(activitiesResult).toEqual(mockResult);
    });
  });
});
