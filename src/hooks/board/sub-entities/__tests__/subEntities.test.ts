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
    vi.spyOn(cardApi, "getCardById").mockResolvedValue({
      id: "c-1",
      updatedAt: "2026-10-10T10:00:00.000Z",
      tasksCount: 0,
      completedTasksCount: 0,
    } as never);
    vi.spyOn(cardApi, "getCardLabels").mockResolvedValue([] as never);
    vi.spyOn(cardApi, "getCardTasks").mockResolvedValue([] as never);
    vi.spyOn(cardApi, "getCardComments").mockResolvedValue([] as never);
    vi.spyOn(cardApi, "getCardAttachments").mockResolvedValue([] as never);
    vi.spyOn(cardApi, "getCardDependencies").mockResolvedValue([] as never);
    vi.spyOn(cardApi, "getCardAssignments").mockResolvedValue([] as never);
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

    it("resets pendingLabelId when drawer closes (selectedCardId = null)", async () => {
      let resolveAttach: (val: unknown) => void = () => {};
      const attachPromise = new Promise((resolve) => {
        resolveAttach = resolve;
      });
      vi.spyOn(cardApi, "attachCardLabel").mockReturnValue(attachPromise as never);

      const setBoard = vi.fn();
      const { result, rerender } = renderHook(
        ({ cardId }) => useCardLabels({ selectedCardId: cardId, setBoard }),
        { initialProps: { cardId: "c-1" as string | null } }
      );

      let attachOp!: Promise<void>;
      act(() => {
        attachOp = result.current.handleAttachCardLabel("c-1", "lbl-1");
      });

      expect(result.current.pendingLabelId).toBe("lbl-1");

      // Close drawer while request is still pending
      rerender({ cardId: null });

      expect(result.current.pendingLabelId).toBeNull();

      // Clean up in-flight promise
      await act(async () => {
        resolveAttach({ id: "lbl-1", boardId: "b-1", name: "Bug", color: "#EF4444" });
        await attachOp.catch(() => {});
      });
    });

    it("prevents stale label responses from overwriting newly selected card", async () => {
      let currentBoard = createMockBoard();
      currentBoard.lists[0].cards.push({
        ...currentBoard.lists[0].cards[0],
        id: "c-2",
        title: "Card 2",
        labels: [],
      });

      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      let resolveCard1Labels: (val: unknown) => void = () => {};
      const card1Promise = new Promise((resolve) => {
        resolveCard1Labels = resolve;
      });

      vi.spyOn(cardApi, "getCardLabels").mockImplementation((cardId: string) => {
        if (cardId === "c-1") {
          return card1Promise as never;
        }
        return Promise.resolve([
          { id: "lbl-2", boardId: "b-1", name: "Card 2 Label", color: "#3B82F6" },
        ]) as never;
      });

      const { rerender } = renderHook(
        ({ cardId }) => useCardLabels({ selectedCardId: cardId, setBoard }),
        { initialProps: { cardId: "c-1" as string | null } }
      );

      // Switch to Card 2 before Card 1 finishes
      await act(async () => {
        rerender({ cardId: "c-2" });
      });

      // Card 2 labels should be loaded
      expect(currentBoard.lists[0].cards.find((c) => c.id === "c-2")?.labels).toHaveLength(1);
      expect(currentBoard.lists[0].cards.find((c) => c.id === "c-2")?.labels[0].name).toBe("Card 2 Label");

      // Now Card 1 finishes late
      await act(async () => {
        resolveCard1Labels([
          { id: "lbl-1", boardId: "b-1", name: "Stale Card 1 Label", color: "#EF4444" },
        ]);
      });

      // Card 1 response must be ignored because active card was changed to c-2
      const card2 = currentBoard.lists[0].cards.find((c) => c.id === "c-2");
      expect(card2?.labels).toHaveLength(1);
      expect(card2?.labels[0].name).toBe("Card 2 Label");
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
    it("does not overwrite unrelated concurrent board updates when dependency API fails", async () => {
      let currentBoard = createMockBoard();
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
        else currentBoard = updater;
      });

      let rejectDep: (err: unknown) => void = () => {};
      const depPromise = new Promise((_, reject) => {
        rejectDep = reject;
      });
      vi.spyOn(cardApi, "addDependency").mockReturnValue(depPromise as never);

      const { result } = renderHook(() =>
        useCardDependencies({ selectedCardId: "c-1", board: currentBoard, setBoard })
      );

      let addOp!: Promise<void>;
      act(() => {
        addOp = result.current.handleAddDependency("c-1", "c-2");
      });

      // Simulate concurrent unrelated board change while addDependency is pending
      act(() => {
        setBoard((prev: BoardDetail | null) => {
          if (!prev) return prev;
          return { ...prev, name: "Concurrent Board Rename" };
        });
      });

      expect(currentBoard.name).toBe("Concurrent Board Rename");

      // Now reject dependency API call
      await act(async () => {
        rejectDep(new Error("Network failure"));
        await expect(addOp).rejects.toThrow("Network failure");
      });

      // Verified: The concurrent board rename is preserved and NOT overwritten by an old snapshot!
      expect(currentBoard.name).toBe("Concurrent Board Rename");
      expect(currentBoard.lists[0].cards[0].dependencies).toEqual([]);
    });

    it("deletes dependency on server success", async () => {
      let currentBoard = createMockBoard({
        dependencies: [
          {
            id: "dep-1",
            cardId: "c-1",
            prerequisiteCardId: "c-2",
            prerequisiteCode: "NEX-2",
            prerequisiteTitle: "Prerequisite Card",
            prerequisiteStatus: "TODO",
            isCompleted: false,
          },
        ],
      });
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      vi.spyOn(cardApi, "deleteDependency").mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useCardDependencies({ selectedCardId: "c-1", board: currentBoard, setBoard })
      );

      await act(async () => {
        await result.current.handleDeleteDependency("c-1", "dep-1");
      });

      expect(cardApi.deleteDependency).toHaveBeenCalledWith("c-1", "dep-1");
      expect(currentBoard.lists[0].cards[0].dependencies).toHaveLength(0);
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

      const { result } = renderHook(() =>
        useCardTasks({ selectedCardId: "c-1", setBoard })
      );

      // Settle initial load
      await act(async () => {
        await Promise.resolve();
      });

      // Reconcile card fetch fails
      vi.spyOn(cardApi, "getCardById").mockRejectedValue(new Error("Transient network error"));

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

    it("toggles and deletes checklist items updating counts and checklist array", async () => {
      let currentBoard = createMockBoard({
        checklist: [
          { id: "t-1", cardId: "c-1", title: "Task 1", isCompleted: false, position: 1024, createdAt: "", updatedAt: "" },
        ],
        tasksCount: 1,
        completedTasksCount: 0,
      });
      const setBoard = vi.fn((updater) => {
        if (typeof updater === "function") currentBoard = updater(currentBoard);
      });

      vi.spyOn(cardApi, "getCardTasks").mockResolvedValue(currentBoard.lists[0].cards[0].checklist as never);

      // Toggle
      vi.spyOn(cardApi, "updateChecklistItem").mockResolvedValue({
        id: "t-1",
        cardId: "c-1",
        title: "Task 1",
        isCompleted: true,
        position: 1024,
        createdAt: "",
        updatedAt: "",
      });
      vi.spyOn(cardApi, "getCardById").mockResolvedValue({
        ...currentBoard.lists[0].cards[0],
        updatedAt: "2026-10-10T12:00:00.000Z",
        tasksCount: 1,
        completedTasksCount: 1,
      });

      const { result } = renderHook(() =>
        useCardTasks({ selectedCardId: "c-1", setBoard })
      );

      await act(async () => {
        await Promise.resolve();
      });

      await act(async () => {
        await result.current.handleToggleChecklistItem("c-1", "t-1", true);
      });

      expect(cardApi.updateChecklistItem).toHaveBeenCalledWith("t-1", { isCompleted: true });
      expect(currentBoard.lists[0].cards[0].checklist?.[0].isCompleted).toBe(true);
      expect(currentBoard.lists[0].cards[0].completedTasksCount).toBe(1);

      // Delete
      vi.spyOn(cardApi, "deleteChecklistItem").mockResolvedValue(undefined);
      vi.spyOn(cardApi, "getCardById").mockResolvedValue({
        ...currentBoard.lists[0].cards[0],
        updatedAt: "2026-10-10T12:05:00.000Z",
        tasksCount: 0,
        completedTasksCount: 0,
      });

      await act(async () => {
        await result.current.handleDeleteChecklistItem("c-1", "t-1");
      });

      expect(cardApi.deleteChecklistItem).toHaveBeenCalledWith("t-1");
      expect(currentBoard.lists[0].cards[0].checklist).toHaveLength(0);
      expect(currentBoard.lists[0].cards[0].tasksCount).toBe(0);
    });
  });
});
