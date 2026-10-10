import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBoardDetail } from "../useBoardDetail";
import { boardApi } from "@/apis/board.api";
import { listApi } from "@/apis/list.api";
import { cardApi } from "@/apis/card.api";
import type { Board, KanbanList, KanbanCard, BoardMember } from "@/types";

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
});
