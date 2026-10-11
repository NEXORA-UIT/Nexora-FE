import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useCardComments,
  useCardAttachments,
  useCardLabels,
  useCardAssignments,
  useCardDependencies,
  useCardTasks,
} from "../index";
import { cardApi } from "@/apis";
import type { BoardDetail, KanbanCard } from "@/types";

describe("Sub-Entity Domain Hooks Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockBoard = (initialCard?: Partial<KanbanCard>): BoardDetail => {
    const card: KanbanCard = {
      id: "c-1",
      listId: "list-1",
      boardId: "b-1",
      code: "NEX-1",
      title: "Sample Card",
      priority: "MEDIUM",
      position: 1024,
      status: "ACTIVE",
      statusGroup: "TODO",
      assignees: [],
      labels: [],
      checklist: [],
      tasksCount: 0,
      completedTasksCount: 0,
      isBlocked: false,
      createdAt: "2026-10-10T10:00:00.000Z",
      updatedAt: "2026-10-10T10:00:00.000Z",
      ...initialCard,
    };

    return {
      id: "b-1",
      workspaceId: "ws-1",
      name: "Test Board",
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
          cards: [card],
          createdAt: "",
          updatedAt: "",
        },
      ],
      archivedListsCount: 0,
      createdAt: "",
      updatedAt: "",
    };
  };

  describe("useCardComments", () => {
    it("resets loading and error states when drawer closes (selectedCardId = null)", () => {
      const setBoard = vi.fn();
      const { result, rerender } = renderHook(
        ({ cardId }) => useCardComments({ selectedCardId: cardId, setBoard }),
        { initialProps: { cardId: "c-1" as string | null } }
      );

      rerender({ cardId: null });

      expect(result.current.isCommentsLoading).toBe(false);
      expect(result.current.commentsError).toBeNull();
    });

    it("creates a comment and updates board state", async () => {
      let currentBoard = createMockBoard();
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      vi.spyOn(cardApi, "createCardComment").mockResolvedValue({
        id: "cmt-1",
        cardId: "c-1",
        userId: "u-1",
        content: "New comment",
        createdAt: "2026-10-10T11:00:00.000Z",
        updatedAt: "2026-10-10T11:00:00.000Z",
        deletedAt: null,
      });

      const { result } = renderHook(() =>
        useCardComments({ selectedCardId: "c-1", setBoard })
      );

      await act(async () => {
        await result.current.handleAddComment("c-1", "New comment");
      });

      expect(cardApi.createCardComment).toHaveBeenCalledWith("c-1", "New comment");
      expect(currentBoard.lists[0].cards[0].comments).toHaveLength(1);
      expect(currentBoard.lists[0].cards[0].comments?.[0].content).toBe("New comment");
    });
  });

  describe("useCardAttachments", () => {
    it("resets states on drawer close", () => {
      const setBoard = vi.fn();
      const { result, rerender } = renderHook(
        ({ cardId }) => useCardAttachments({ selectedCardId: cardId, setBoard }),
        { initialProps: { cardId: "c-1" as string | null } }
      );

      rerender({ cardId: null });

      expect(result.current.isAttachmentsLoading).toBe(false);
      expect(result.current.attachmentsError).toBeNull();
      expect(result.current.isUploadingAttachment).toBe(false);
      expect(result.current.pendingAttachmentId).toBeNull();
    });

    it("deletes an attachment and removes it from board card", async () => {
      let currentBoard = createMockBoard({
        attachments: [
          {
            id: "att-1",
            cardId: "c-1",
            uploadedBy: {
              id: "u-1",
              name: "Alice",
              initials: "A",
              role: "ADMIN",
            },
            fileName: "spec.pdf",
            fileSize: 1024,
            mimeType: "application/pdf",
            fileUrl: "/files/spec.pdf",
            uploadedAt: "2026-10-10T10:00:00.000Z",
          },
        ],
      });
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      vi.spyOn(cardApi, "deleteCardAttachment").mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useCardAttachments({ selectedCardId: "c-1", setBoard })
      );

      await act(async () => {
        await result.current.handleDeleteAttachment("att-1");
      });

      expect(cardApi.deleteCardAttachment).toHaveBeenCalledWith("att-1");
      expect(currentBoard.lists[0].cards[0].attachments).toHaveLength(0);
    });
  });

  describe("useCardLabels", () => {
    it("attaches a label and reconciles card timestamp", async () => {
      let currentBoard = createMockBoard();
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      const mockLabel = { id: "lbl-1", boardId: "b-1", name: "Bug", color: "#EF4444" };
      vi.spyOn(cardApi, "attachCardLabel").mockResolvedValue(mockLabel);
      vi.spyOn(cardApi, "getCardById").mockResolvedValue({
        ...currentBoard.lists[0].cards[0],
        updatedAt: "2026-10-10T10:15:00.000Z",
      });

      const { result } = renderHook(() =>
        useCardLabels({ selectedCardId: "c-1", setBoard })
      );

      await act(async () => {
        await result.current.handleAttachCardLabel("c-1", "lbl-1");
      });

      expect(cardApi.attachCardLabel).toHaveBeenCalledWith("c-1", "lbl-1");
      expect(currentBoard.lists[0].cards[0].labels).toHaveLength(1);
      expect(currentBoard.lists[0].cards[0].updatedAt).toBe("2026-10-10T10:15:00.000Z");
    });
  });

  describe("useCardAssignments", () => {
    it("assigns a member and unassigns member cleanly", async () => {
      let currentBoard = createMockBoard();
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      vi.spyOn(cardApi, "assignCardMember").mockResolvedValue({
        id: "asg-1",
        cardId: "c-1",
        userId: "u-1",
        assignedAt: "2026-10-10T10:00:00.000Z",
      });
      vi.spyOn(cardApi, "unassignCardMember").mockResolvedValue(undefined);
      vi.spyOn(cardApi, "getCardById").mockResolvedValue(currentBoard.lists[0].cards[0]);

      const { result } = renderHook(() =>
        useCardAssignments({ selectedCardId: "c-1", setBoard })
      );

      await act(async () => {
        await result.current.handleAssignMember("c-1", "u-1");
      });

      expect(cardApi.assignCardMember).toHaveBeenCalledWith("c-1", "u-1");
      expect(currentBoard.lists[0].cards[0].assignees).toHaveLength(1);
      expect(currentBoard.lists[0].cards[0].assignees[0].id).toBe("u-1");

      await act(async () => {
        await result.current.handleUnassignMember("c-1", "u-1");
      });

      expect(cardApi.unassignCardMember).toHaveBeenCalledWith("c-1", "u-1");
      expect(currentBoard.lists[0].cards[0].assignees).toHaveLength(0);
    });
  });

  describe("useCardDependencies", () => {
    it("rolls back optimistic dependency addition on server failure", async () => {
      let currentBoard = createMockBoard();
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
        else currentBoard = updater;
      });

      vi.spyOn(cardApi, "addDependency").mockRejectedValue(new Error("Network failure"));

      const { result } = renderHook(() =>
        useCardDependencies({ selectedCardId: "c-1", board: currentBoard, setBoard })
      );

      await expect(
        act(async () => {
          await result.current.handleAddDependency("c-1", "c-2");
        })
      ).rejects.toThrow("Network failure");

      expect(cardApi.addDependency).toHaveBeenCalledWith("c-1", { dependsOnCardId: "c-2" });
      // Rolled back to original state with empty dependencies
      expect(currentBoard.lists[0].cards[0].dependencies).toBeUndefined();
    });
  });

  describe("useCardTasks", () => {
    it("adds checklist item and retains local addition even if authoritative card refresh fails", async () => {
      let currentBoard = createMockBoard();
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      const newItem = {
        id: "t-1",
        cardId: "c-1",
        title: "Test Checklist Item",
        isCompleted: false,
        position: 1024,
        createdAt: "",
        updatedAt: "",
      };

      vi.spyOn(cardApi, "addChecklistItem").mockResolvedValue(newItem);
      // Reconcile card fetch fails
      vi.spyOn(cardApi, "getCardById").mockRejectedValue(new Error("Transient network error"));

      const { result } = renderHook(() =>
        useCardTasks({ selectedCardId: "c-1", setBoard })
      );

      await act(async () => {
        await result.current.handleAddChecklistItem("c-1", "Test Checklist Item");
      });

      expect(cardApi.addChecklistItem).toHaveBeenCalledWith("c-1", "Test Checklist Item");
      // Task is NOT rolled back! It remains in local state
      expect(currentBoard.lists[0].cards[0].checklist).toHaveLength(1);
      expect(currentBoard.lists[0].cards[0].checklist?.[0].title).toBe("Test Checklist Item");
      // But error state is set for retry
      expect(result.current.tasksError).toBe("Unable to sync latest card timestamp. Click Retry to sync.");
    });
  });
});
