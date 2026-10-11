import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBoardCardMutations, useCardSubEntities } from "../index";
import { cardApi, listApi } from "@/apis";
import type { BoardDetail, KanbanList } from "@/types";

describe("Modular Board Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBoardDetail: BoardDetail = {
    id: "b-1",
    workspaceId: "ws-1",
    name: "Sprint Board",
    status: "ACTIVE",
    members: [
      { id: "u-1", name: "Alice", initials: "A", role: "ADMIN" },
      { id: "u-2", name: "Bob", initials: "B", role: "MEMBER" },
    ],
    labels: [],
    lists: [
      {
        id: "list-1",
        boardId: "b-1",
        name: "Todo",
        category: "TODO",
        position: 1024,
        status: "ACTIVE",
        cards: [
          {
            id: "c-1",
            listId: "list-1",
            boardId: "b-1",
            code: "NEX-1",
            title: "Task 1",
            priority: "MEDIUM",
            position: 1024,
            status: "ACTIVE",
            statusGroup: "TODO",
            assignees: [],
            labels: [],
            tasksCount: 0,
            completedTasksCount: 0,
            isBlocked: false,
            createdAt: "2026-10-10T00:00:00Z",
            updatedAt: "2026-10-10T00:00:00Z",
          },
        ],
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      },
    ],
    archivedListsCount: 0,
    createdAt: "2026-10-10T00:00:00Z",
    updatedAt: "2026-10-10T00:00:00Z",
  };

  describe("useBoardCardMutations", () => {
    it("handles adding a column and updates board state", async () => {
      let currentBoard: BoardDetail | null = mockBoardDetail;
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") {
          currentBoard = updater(currentBoard);
        } else {
          currentBoard = updater;
        }
      });
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      const createdList: KanbanList = {
        id: "list-2",
        boardId: "b-1",
        name: "In Progress",
        category: "IN_PROGRESS",
        position: 2048,
        status: "ACTIVE",
        cards: [],
        createdAt: "2026-10-10T00:00:00Z",
        updatedAt: "2026-10-10T00:00:00Z",
      };

      vi.spyOn(listApi, "createList").mockResolvedValue(createdList);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: null,
          setSelectedCardId,
        })
      );

      await act(async () => {
        await result.current.handleAddColumn("In Progress", "IN_PROGRESS");
      });

      expect(listApi.createList).toHaveBeenCalledWith("b-1", {
        name: "In Progress",
        category: "IN_PROGRESS",
      });
      expect(setBoard).toHaveBeenCalled();
    });

    it("handles deleting a card and deselects if it was active", async () => {
      const currentBoard: BoardDetail | null = mockBoardDetail;
      const setBoard = vi.fn();
      const reloadBoard = vi.fn().mockResolvedValue(undefined);
      const setSelectedCardId = vi.fn();

      vi.spyOn(cardApi, "deleteCard").mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useBoardCardMutations({
          boardId: "b-1",
          board: currentBoard,
          setBoard,
          reloadBoard,
          selectedCardId: "c-1",
          setSelectedCardId,
        })
      );

      await act(async () => {
        await result.current.handleDeleteCard("c-1");
      });

      expect(cardApi.deleteCard).toHaveBeenCalledWith("c-1");
      expect(setSelectedCardId).toHaveBeenCalledWith(null);
    });
  });

  describe("useCardSubEntities", () => {
    it("initializes with default empty/clean states when no card is selected", () => {
      const setBoard = vi.fn();
      const { result } = renderHook(() =>
        useCardSubEntities({
          selectedCardId: null,
          board: mockBoardDetail,
          setBoard,
        })
      );

      expect(result.current.isTasksLoading).toBe(false);
      expect(result.current.tasksError).toBeNull();
      expect(result.current.isAssignmentsLoading).toBe(false);
      expect(result.current.assignmentsError).toBeNull();
      expect(result.current.isLabelsLoading).toBe(false);
      expect(result.current.labelsError).toBeNull();
      expect(result.current.isCommentsLoading).toBe(false);
      expect(result.current.commentsError).toBeNull();
      expect(result.current.isAttachmentsLoading).toBe(false);
      expect(result.current.attachmentsError).toBeNull();
      expect(result.current.isDependenciesLoading).toBe(false);
      expect(result.current.dependenciesError).toBeNull();
    });

    it("loads all 6 sub-entities when card is selected", async () => {
      const setBoard = vi.fn();
      vi.spyOn(cardApi, "getCardTasks").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardById").mockResolvedValue(mockBoardDetail.lists[0].cards[0]);
      vi.spyOn(cardApi, "getCardAssignments").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardLabels").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardComments").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardAttachments").mockResolvedValue([]);
      vi.spyOn(cardApi, "getCardDependencies").mockResolvedValue([]);

      renderHook(() =>
        useCardSubEntities({
          selectedCardId: "c-1",
          board: mockBoardDetail,
          setBoard,
        })
      );

      await act(async () => {
        // Allow in-flight loaders to settle
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(cardApi.getCardTasks).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardAssignments).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardLabels).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardComments).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardAttachments).toHaveBeenCalledWith("c-1");
      expect(cardApi.getCardDependencies).toHaveBeenCalledWith("c-1");
    });
  });
});
