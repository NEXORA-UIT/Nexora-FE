import { describe, it, expect, vi, beforeEach } from "vitest";
import { cardApi } from "../card.api";
import { apiClient, ApiError } from "../client";
import type { CardDto } from "@/types";

describe("cardApi Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCardDto1: CardDto = {
    id: "card-1",
    boardId: "board-1",
    listId: "list-1",
    cardKey: "NEX-1",
    title: "Task 1",
    description: "Description 1",
    startDate: null,
    dueDate: "2026-10-20T00:00:00.000Z",
    priority: "HIGH",
    position: 1024,
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:30:00.000Z",
    statusGroup: "TODO",
    taskProgress: {
      total: 2,
      completed: 1,
      percent: 50,
    },
  };

  const mockCardDto2: CardDto = {
    id: "card-2",
    boardId: "board-1",
    listId: "list-2",
    cardKey: "NEX-2",
    title: "Task 2",
    description: null,
    startDate: "2026-10-10T00:00:00.000Z",
    dueDate: "2026-10-25T00:00:00.000Z",
    priority: "MEDIUM",
    position: 2048,
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:45:00.000Z",
    statusGroup: "IN_PROGRESS",
    taskProgress: {
      total: 0,
      completed: 0,
      percent: 0,
    },
  };

  describe("cardApi.getBoardCards", () => {
    it("requests GET /boards/:boardId/cards with undefined params by default and maps data", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockCardDto1, mockCardDto2],
        },
      });

      const result = await cardApi.getBoardCards("board-1");

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/cards", {
        params: undefined,
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("card-1");
      expect(result[0].code).toBe("NEX-1");
      expect(result[0].title).toBe("Task 1");
      expect(result[0].tasksCount).toBe(2);
      expect(result[0].completedTasksCount).toBe(1);
      expect(result[0].status).toBe("ACTIVE");
      expect(result[1].id).toBe("card-2");
      expect(result[1].code).toBe("NEX-2");
      expect(result[1].status).toBe("ACTIVE");
    });

    it("sends includeArchived='true' when requested", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockCardDto1],
        },
      });

      await cardApi.getBoardCards("board-1", { includeArchived: true });

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/cards", {
        params: { includeArchived: "true" },
      });
    });

    it("sends includeArchived='false' when explicitly false", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockCardDto1],
        },
      });

      await cardApi.getBoardCards("board-1", { includeArchived: false });

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/cards", {
        params: { includeArchived: "false" },
      });
    });

    it("propagates API errors without fallback to mock", async () => {
      const mockError = new ApiError("Board not found", "NOT_FOUND", 404);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(mockError);

      await expect(cardApi.getBoardCards("unknown-board")).rejects.toThrow(mockError);
    });
  });

  describe("cardApi.createCard", () => {
    it("sends POST /lists/:listId/cards with sanitized payload and maps response to KanbanCard", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCardDto1,
        },
      });

      const result = await cardApi.createCard("list-1", {
        title: "  Task 1  ",
        description: "Description 1",
        priority: "HIGH",
        dueDate: "2026-10-20T00:00:00.000Z",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/lists/list-1/cards", {
        title: "Task 1",
        description: "Description 1",
        priority: "HIGH",
        dueDate: "2026-10-20T00:00:00.000Z",
      });
      expect(result.id).toBe("card-1");
      expect(result.code).toBe("NEX-1");
      expect(result.title).toBe("Task 1");
      expect(result.status).toBe("ACTIVE");
      expect(result.tasksCount).toBe(2);
      expect(result.completedTasksCount).toBe(1);
    });

    it("strips unsupported fields like assigneeIds and labelIds to adhere to strict backend schema", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCardDto1,
        },
      });

      await cardApi.createCard("list-1", {
        title: "Clean card",
        assigneeIds: ["user-1"],
        labelIds: ["label-1"],
      });

      expect(apiClient.post).toHaveBeenCalledWith("/lists/list-1/cards", {
        title: "Clean card",
      });
    });

    it("propagates 409 conflict when board card limit (2000) is reached", async () => {
      const mockError = new ApiError("Board đã đạt giới hạn 2.000 Card", "CARD_LIMIT_REACHED", 409);
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(mockError);

      await expect(
        cardApi.createCard("list-1", { title: "Limit Card" })
      ).rejects.toThrow(mockError);
    });

    it("normalizes empty string dates to null in createCard payload", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCardDto1,
        },
      });

      await cardApi.createCard("list-1", {
        title: "Date normalization card",
        startDate: "",
        dueDate: "",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/lists/list-1/cards", {
        title: "Date normalization card",
        startDate: null,
        dueDate: null,
      });
    });

    it("propagates 400 validation error on invalid date order", async () => {
      const mockError = new ApiError("Ngày bắt đầu phải trước hoặc bằng hạn chót", "VALIDATION_ERROR", 400);
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(mockError);

      await expect(
        cardApi.createCard("list-1", {
          title: "Date Error",
          startDate: "2026-10-20T00:00:00.000Z",
          dueDate: "2026-10-10T00:00:00.000Z",
        })
      ).rejects.toThrow(mockError);
    });
  });

  describe("cardApi.updateCard", () => {
    it("sends PATCH /cards/:id with sanitized payload and required updatedAt", async () => {
      const updatedDto: CardDto = {
        ...mockCardDto1,
        title: "Updated Task 1",
        description: "Updated description",
        updatedAt: "2026-10-09T09:00:00.000Z",
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: updatedDto,
        },
      });

      const result = await cardApi.updateCard("card-1", {
        title: "  Updated Task 1  ",
        description: "Updated description",
        updatedAt: "2026-10-09T08:30:00.000Z",
      });

      expect(apiClient.patch).toHaveBeenCalledWith("/cards/card-1", {
        title: "Updated Task 1",
        description: "Updated description",
        updatedAt: "2026-10-09T08:30:00.000Z",
      });
      expect(result.title).toBe("Updated Task 1");
      expect(result.description).toBe("Updated description");
      expect(result.updatedAt).toBe("2026-10-09T09:00:00.000Z");
    });

    it("strips unsupported fields like assigneeIds and labelIds from update payload", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCardDto1,
        },
      });

      await cardApi.updateCard("card-1", {
        priority: "URGENT",
        assigneeIds: ["user-2"],
        labelIds: ["label-2"],
        updatedAt: "2026-10-09T08:30:00.000Z",
      });

      expect(apiClient.patch).toHaveBeenCalledWith("/cards/card-1", {
        priority: "URGENT",
        updatedAt: "2026-10-09T08:30:00.000Z",
      });
    });

    it("normalizes empty string dates to null in updateCard payload", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCardDto1,
        },
      });

      await cardApi.updateCard("card-1", {
        startDate: "",
        dueDate: "",
        updatedAt: "2026-10-09T08:30:00.000Z",
      });

      expect(apiClient.patch).toHaveBeenCalledWith("/cards/card-1", {
        startDate: null,
        dueDate: null,
        updatedAt: "2026-10-09T08:30:00.000Z",
      });
    });

    it("propagates 409 CARD_CONFLICT when OCC timestamp is mismatched", async () => {
      const mockError = new ApiError("Card đã được cập nhật; hãy tải lại dữ liệu", "CARD_CONFLICT", 409);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(
        cardApi.updateCard("card-1", {
          title: "Stale update",
          updatedAt: "2020-01-01T00:00:00.000Z",
        })
      ).rejects.toThrow(mockError);
    });

    it("propagates 400 validation error when no editable fields are provided", async () => {
      const mockError = new ApiError("Phải có ít nhất một trường cần cập nhật", "VALIDATION_ERROR", 400);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(
        cardApi.updateCard("card-1", {
          updatedAt: "2026-10-09T08:30:00.000Z",
        })
      ).rejects.toThrow(mockError);
    });
  });

  describe("cardApi.moveCard", () => {
    it("sends PATCH /cards/:id/move with targetListId, position, and updatedAt", async () => {
      const movedDto: CardDto = {
        ...mockCardDto1,
        listId: "list-2",
        position: 3072,
        updatedAt: "2026-10-09T09:15:00.000Z",
        statusGroup: "IN_PROGRESS",
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: movedDto,
        },
      });

      const result = await cardApi.moveCard("card-1", {
        targetListId: "list-2",
        position: 3072,
        updatedAt: "2026-10-09T08:30:00.000Z",
      });

      expect(apiClient.patch).toHaveBeenCalledWith("/cards/card-1/move", {
        targetListId: "list-2",
        position: 3072,
        updatedAt: "2026-10-09T08:30:00.000Z",
      });
      expect(result.listId).toBe("list-2");
      expect(result.position).toBe(3072);
      expect(result.updatedAt).toBe("2026-10-09T09:15:00.000Z");
    });

    it("propagates 409 CARD_CONFLICT when move OCC fails", async () => {
      const mockError = new ApiError("Card đã được cập nhật; hãy tải lại dữ liệu", "CARD_CONFLICT", 409);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(
        cardApi.moveCard("card-1", {
          targetListId: "list-2",
          position: 1024,
          updatedAt: "2020-01-01T00:00:00.000Z",
        })
      ).rejects.toThrow(mockError);
    });

    it("propagates 400/409 error when moving blocked card to DONE list", async () => {
      const mockError = new ApiError("Không thể chuyển sang DONE do điều kiện phụ thuộc", "DEPENDENCY_BLOCK", 400);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(
        cardApi.moveCard("card-1", {
          targetListId: "list-done",
          position: 1024,
          updatedAt: "2026-10-09T08:30:00.000Z",
        })
      ).rejects.toThrow(mockError);
    });
  });

  describe("cardApi.archiveCard & restoreCard", () => {
    it("sends PATCH /cards/:id/archive with no body", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await cardApi.archiveCard("card-1");

      expect(apiClient.patch).toHaveBeenCalledWith("/cards/card-1/archive");
    });

    it("propagates 409 when card is already archived", async () => {
      const mockError = new ApiError("Card đã được archive", "CARD_ALREADY_ARCHIVED", 409);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(cardApi.archiveCard("card-1")).rejects.toThrow(mockError);
    });

    it("sends PATCH /cards/:id/restore with no body", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await cardApi.restoreCard("card-1");

      expect(apiClient.patch).toHaveBeenCalledWith("/cards/card-1/restore");
    });

    it("propagates 409 when restoring card whose parent list is archived", async () => {
      const mockError = new ApiError("List đã bị lưu trữ", "ARCHIVED_LIST", 409);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(cardApi.restoreCard("card-1")).rejects.toThrow(mockError);
    });
  });

  describe("cardApi.deleteCard", () => {
    it("sends DELETE /cards/:id", async () => {
      vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await cardApi.deleteCard("card-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/cards/card-1");
    });

    it("propagates 404 when card is not found or already deleted", async () => {
      const mockError = new ApiError("Card không tồn tại", "NOT_FOUND", 404);
      vi.spyOn(apiClient, "delete").mockRejectedValueOnce(mockError);

      await expect(cardApi.deleteCard("unknown-card")).rejects.toThrow(mockError);
    });
  });

  describe("Child Resources (Mock-backed in Step 4)", () => {
    it("adds, toggles, and deletes checklist items", async () => {
      const initialCard = await cardApi.getCardById("card-101");
      const initialTasksCount = initialCard.tasksCount;

      // Add task
      const newTask = await cardApi.addChecklistItem("card-101", "Verify SEO metadata");
      expect(newTask.title).toBe("Verify SEO metadata");
      expect(newTask.isCompleted).toBe(false);

      const cardAfterAdd = await cardApi.getCardById("card-101");
      expect(cardAfterAdd.tasksCount).toBe(initialTasksCount + 1);

      // Toggle task
      const toggled = await cardApi.updateChecklistItem(newTask.id, { isCompleted: true });
      expect(toggled.isCompleted).toBe(true);

      const cardAfterToggle = await cardApi.getCardById("card-101");
      expect(cardAfterToggle.completedTasksCount).toBeGreaterThanOrEqual(2);

      // Delete task
      await cardApi.deleteChecklistItem(newTask.id);
      const cardAfterDelete = await cardApi.getCardById("card-101");
      expect(cardAfterDelete.tasksCount).toBe(initialTasksCount);
    });

    it("adds a comment and lazy-loads activities", async () => {
      const comment = await cardApi.addComment("card-101", "Ready for deployment test");
      expect(comment.content).toBe("Ready for deployment test");

      const activities = await cardApi.getActivities("card-101");
      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThanOrEqual(1);
    });

    it("adds and deletes a dependency", async () => {
      // Add dependency: card-102 depends on card-101
      const dep = await cardApi.addDependency("card-102", {
        dependsOnCardId: "card-101",
      });

      expect(dep.cardId).toBe("card-102");
      expect(dep.prerequisiteCardId).toBe("card-101");

      const card = await cardApi.getCardById("card-102");
      expect(card.dependencies?.some((d) => d.id === dep.id)).toBe(true);

      // Delete dependency
      await cardApi.deleteDependency("card-102", dep.id);
      const cardAfterDelete = await cardApi.getCardById("card-102");
      expect(cardAfterDelete.dependencies?.some((d) => d.id === dep.id)).toBe(false);
    });

    it("rejects self-dependency in addDependency", async () => {
      await expect(
        cardApi.addDependency("card-101", {
          dependsOnCardId: "card-101",
        })
      ).rejects.toThrow("Cannot depend on self");
    });
  });
});
