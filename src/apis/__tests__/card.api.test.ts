import { describe, it, expect, vi, beforeEach } from "vitest";
import { cardApi } from "../card.api";
import { apiClient, ApiError } from "../client";
import type { CardDto, TaskDto, CardAssignmentDto, BoardLabelDto, CardLabelDto } from "@/types";

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

  describe("cardApi.getCardById", () => {
    it("requests GET /cards/:id and maps response to KanbanCard", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCardDto1,
        },
      });

      const card = await cardApi.getCardById("card-1");

      expect(apiClient.get).toHaveBeenCalledWith("/cards/card-1");
      expect(card.id).toBe("card-1");
      expect(card.code).toBe("NEX-1");
      expect(card.updatedAt).toBe(mockCardDto1.updatedAt);
      expect(card.tasksCount).toBe(2);
      expect(card.completedTasksCount).toBe(1);
    });

    it("propagates error when card fetch fails", async () => {
      const mockError = new ApiError("Card không tồn tại", "NOT_FOUND", 404);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(mockError);

      await expect(cardApi.getCardById("unknown-card")).rejects.toThrow(mockError);
    });
  });

  describe("cardApi Tasks / Checklist Endpoints", () => {
    const mockTask1: TaskDto = {
      id: "task-uuid-1",
      cardId: "card-uuid-1",
      title: "Write integration tests",
      isCompleted: false,
      position: 1024,
      createdAt: "2026-10-10T08:00:00.000Z",
      updatedAt: "2026-10-10T08:00:00.000Z",
    };

    const mockTask2: TaskDto = {
      id: "task-uuid-2",
      cardId: "card-uuid-1",
      title: "Review PR checklist",
      isCompleted: true,
      position: 2048,
      createdAt: "2026-10-10T08:30:00.000Z",
      updatedAt: "2026-10-10T09:00:00.000Z",
    };

    describe("getCardTasks", () => {
      it("requests GET /cards/:cardId/tasks and maps response to sorted ChecklistItems", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: {
            success: true,
            data: [mockTask2, mockTask1],
          },
        });

        const tasks = await cardApi.getCardTasks("card-uuid-1");

        expect(apiClient.get).toHaveBeenCalledWith("/cards/card-uuid-1/tasks");
        expect(tasks).toHaveLength(2);
        // Sorted by position ASC: mockTask1 (1024) before mockTask2 (2048)
        expect(tasks[0].id).toBe("task-uuid-1");
        expect(tasks[0].title).toBe("Write integration tests");
        expect(tasks[0].isCompleted).toBe(false);
        expect(tasks[1].id).toBe("task-uuid-2");
        expect(tasks[1].isCompleted).toBe(true);
      });

      it("propagates API error when fetching tasks fails", async () => {
        const error = new ApiError("Forbidden", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.getCardTasks("card-uuid-1")).rejects.toThrow(error);
      });
    });

    describe("addChecklistItem", () => {
      it("requests POST /cards/:cardId/tasks with trimmed title and maps returned TaskDto", async () => {
        vi.spyOn(apiClient, "post").mockResolvedValueOnce({
          data: {
            success: true,
            data: mockTask1,
          },
        });

        const item = await cardApi.addChecklistItem("card-uuid-1", "  Write integration tests  ");

        expect(apiClient.post).toHaveBeenCalledWith("/cards/card-uuid-1/tasks", {
          title: "Write integration tests",
        });
        expect(item.id).toBe("task-uuid-1");
        expect(item.cardId).toBe("card-uuid-1");
        expect(item.title).toBe("Write integration tests");
        expect(item.isCompleted).toBe(false);
      });

      it("propagates TASK_LIMIT_REACHED error when card reaches 50 tasks", async () => {
        const error = new ApiError("Card đạt giới hạn tối đa 50 Tasks", "TASK_LIMIT_REACHED", 409);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(
          cardApi.addChecklistItem("card-uuid-1", "Another task")
        ).rejects.toThrow(error);
      });
    });

    describe("updateChecklistItem", () => {
      it("requests PATCH /tasks/:taskId with title and isCompleted and maps returned TaskDto", async () => {
        const updatedTask: TaskDto = {
          ...mockTask1,
          title: "Updated title",
          isCompleted: true,
          updatedAt: "2026-10-10T10:00:00.000Z",
        };

        vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
          data: {
            success: true,
            data: updatedTask,
          },
        });

        const item = await cardApi.updateChecklistItem("task-uuid-1", {
          title: "  Updated title  ",
          isCompleted: true,
        });

        expect(apiClient.patch).toHaveBeenCalledWith("/tasks/task-uuid-1", {
          title: "Updated title",
          isCompleted: true,
        });
        expect(item.id).toBe("task-uuid-1");
        expect(item.title).toBe("Updated title");
        expect(item.isCompleted).toBe(true);
      });

      it("requests PATCH /tasks/:taskId with only isCompleted toggle", async () => {
        vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
          data: {
            success: true,
            data: { ...mockTask1, isCompleted: true },
          },
        });

        const item = await cardApi.updateChecklistItem("task-uuid-1", {
          isCompleted: true,
        });

        expect(apiClient.patch).toHaveBeenCalledWith("/tasks/task-uuid-1", {
          isCompleted: true,
        });
        expect(item.isCompleted).toBe(true);
      });

      it("propagates error when updating task fails", async () => {
        const error = new ApiError("Task not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "patch").mockRejectedValueOnce(error);

        await expect(
          cardApi.updateChecklistItem("unknown-task", { isCompleted: true })
        ).rejects.toThrow(error);
      });
    });

    describe("deleteChecklistItem", () => {
      it("requests DELETE /tasks/:taskId and resolves on success", async () => {
        vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
          data: {
            success: true,
            data: {},
          },
        });

        await expect(cardApi.deleteChecklistItem("task-uuid-1")).resolves.toBeUndefined();

        expect(apiClient.delete).toHaveBeenCalledWith("/tasks/task-uuid-1");
      });

      it("propagates error when deleting task fails", async () => {
        const error = new ApiError("Task not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "delete").mockRejectedValueOnce(error);

        await expect(cardApi.deleteChecklistItem("unknown-task")).rejects.toThrow(error);
      });
    });
  });

  describe("cardApi Assignments Endpoints", () => {
    const mockAssignment: CardAssignmentDto = {
      id: "assign-uuid-1",
      cardId: "card-uuid-1",
      userId: "user-uuid-1",
      assignedAt: "2026-10-10T09:00:00.000Z",
      user: {
        id: "user-uuid-1",
        fullName: "Jane Member",
        email: "jane@nexora.app",
      },
    };

    describe("getCardAssignments", () => {
      it("requests GET /cards/:cardId/assignments and unwraps response data", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: {
            success: true,
            data: [mockAssignment],
          },
        });

        const assignments = await cardApi.getCardAssignments("card-uuid-1");

        expect(apiClient.get).toHaveBeenCalledWith("/cards/card-uuid-1/assignments");
        expect(assignments).toHaveLength(1);
        expect(assignments[0].id).toBe("assign-uuid-1");
        expect(assignments[0].user?.fullName).toBe("Jane Member");
      });

      it("propagates error when fetching assignments fails", async () => {
        const error = new ApiError("Forbidden", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.getCardAssignments("card-uuid-1")).rejects.toThrow(error);
      });
    });

    describe("assignCardMember", () => {
      it("requests POST /cards/:cardId/assignments with userId body", async () => {
        const createdAssignment: CardAssignmentDto = {
          id: "assign-uuid-2",
          cardId: "card-uuid-1",
          userId: "user-uuid-2",
          assignedAt: "2026-10-10T09:30:00.000Z",
        };

        vi.spyOn(apiClient, "post").mockResolvedValueOnce({
          data: {
            success: true,
            data: createdAssignment,
          },
        });

        const result = await cardApi.assignCardMember("card-uuid-1", "user-uuid-2");

        expect(apiClient.post).toHaveBeenCalledWith("/cards/card-uuid-1/assignments", {
          userId: "user-uuid-2",
        });
        expect(result.id).toBe("assign-uuid-2");
        expect(result.userId).toBe("user-uuid-2");
      });

      it("propagates 409 ASSIGNMENT_EXISTS when user is already assigned", async () => {
        const error = new ApiError("Người dùng đã được phân công vào Card", "ASSIGNMENT_EXISTS", 409);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.assignCardMember("card-uuid-1", "user-uuid-1")).rejects.toThrow(error);
      });

      it("propagates 403 FORBIDDEN when user is not eligible", async () => {
        const error = new ApiError("Forbidden", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.assignCardMember("card-uuid-1", "user-locked")).rejects.toThrow(error);
      });
    });

    describe("unassignCardMember", () => {
      it("requests DELETE /cards/:cardId/assignments/:userId and resolves", async () => {
        vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
          data: {
            success: true,
            data: {},
          },
        });

        await expect(cardApi.unassignCardMember("card-uuid-1", "user-uuid-1")).resolves.toBeUndefined();

        expect(apiClient.delete).toHaveBeenCalledWith("/cards/card-uuid-1/assignments/user-uuid-1");
      });

      it("propagates 404 NOT_FOUND when assignment does not exist", async () => {
        const error = new ApiError("Assignment not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "delete").mockRejectedValueOnce(error);

        await expect(cardApi.unassignCardMember("card-uuid-1", "unknown-user")).rejects.toThrow(error);
      });
    });
  });

  describe("cardApi Labels Endpoints", () => {
    const mockBoardLabelDto: BoardLabelDto = {
      id: "label-uuid-1",
      boardId: "board-uuid-1",
      name: "Bug",
      color: "#ef4444",
      createdAt: "2026-10-10T00:00:00.000Z",
      updatedAt: "2026-10-10T00:00:00.000Z",
    };

    const mockCardLabelDto: CardLabelDto = {
      cardId: "card-uuid-1",
      labelId: "label-uuid-1",
      createdAt: "2026-10-10T01:00:00.000Z",
      label: mockBoardLabelDto,
    };

    describe("getBoardLabels", () => {
      it("requests GET /boards/:boardId/labels and maps response data", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: {
            success: true,
            data: [mockBoardLabelDto],
          },
        });

        const labels = await cardApi.getBoardLabels("board-uuid-1");

        expect(apiClient.get).toHaveBeenCalledWith("/boards/board-uuid-1/labels");
        expect(labels).toHaveLength(1);
        expect(labels[0].id).toBe("label-uuid-1");
        expect(labels[0].name).toBe("Bug");
        expect(labels[0].color).toBe("#ef4444");
      });

      it("propagates error when fetching board labels fails", async () => {
        const error = new ApiError("Forbidden", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.getBoardLabels("board-uuid-1")).rejects.toThrow(error);
      });
    });

    describe("getCardLabels", () => {
      it("requests GET /cards/:cardId/labels and unwraps mapped labels", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: {
            success: true,
            data: [mockCardLabelDto],
          },
        });

        const labels = await cardApi.getCardLabels("card-uuid-1");

        expect(apiClient.get).toHaveBeenCalledWith("/cards/card-uuid-1/labels");
        expect(labels).toHaveLength(1);
        expect(labels[0].id).toBe("label-uuid-1");
        expect(labels[0].name).toBe("Bug");
      });

      it("propagates error when fetching card labels fails", async () => {
        const error = new ApiError("Not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.getCardLabels("card-uuid-1")).rejects.toThrow(error);
      });
    });

    describe("attachCardLabel", () => {
      it("requests POST /cards/:cardId/labels with labelId body and maps result", async () => {
        vi.spyOn(apiClient, "post").mockResolvedValueOnce({
          data: {
            success: true,
            data: mockCardLabelDto,
          },
        });

        const result = await cardApi.attachCardLabel("card-uuid-1", "label-uuid-1");

        expect(apiClient.post).toHaveBeenCalledWith("/cards/card-uuid-1/labels", {
          labelId: "label-uuid-1",
        });
        expect(result.id).toBe("label-uuid-1");
        expect(result.name).toBe("Bug");
      });

      it("propagates 409 CARD_LABEL_EXISTS when label is already attached", async () => {
        const error = new ApiError("Label đã được gắn vào Card", "CARD_LABEL_EXISTS", 409);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.attachCardLabel("card-uuid-1", "label-uuid-1")).rejects.toThrow(error);
      });

      it("propagates 404 NOT_FOUND when label does not belong to the board", async () => {
        const error = new ApiError("Label not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.attachCardLabel("card-uuid-1", "label-cross-board")).rejects.toThrow(error);
      });

      it("propagates 403 FORBIDDEN when card is archived", async () => {
        const error = new ApiError("Archived", "ARCHIVED", 403);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.attachCardLabel("card-uuid-1", "label-uuid-1")).rejects.toThrow(error);
      });
    });

    describe("detachCardLabel", () => {
      it("requests DELETE /cards/:cardId/labels/:labelId and resolves", async () => {
        vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
          data: {
            success: true,
            data: {},
          },
        });

        await expect(cardApi.detachCardLabel("card-uuid-1", "label-uuid-1")).resolves.toBeUndefined();

        expect(apiClient.delete).toHaveBeenCalledWith("/cards/card-uuid-1/labels/label-uuid-1");
      });

      it("propagates 404 NOT_FOUND when label attachment does not exist", async () => {
        const error = new ApiError("CardLabel not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "delete").mockRejectedValueOnce(error);

        await expect(cardApi.detachCardLabel("card-uuid-1", "unknown-label")).rejects.toThrow(error);
      });
    });
  });


  describe("Card Dependencies Integration API (Task A)", () => {
    const cardId = "card-uuid-1";
    const depCardId = "card-uuid-2";
    const dependencyId = "dep-uuid-99";

    describe("getCardDependencies", () => {
      it("fetches and maps prerequisites via GET /cards/:cardId/dependencies", async () => {
        const mockPrerequisites = [
          {
            id: depCardId,
            cardKey: "NEX-2",
            title: "Prerequisite Task",
            list: {
              id: "list-1",
              name: "To Do",
              statusGroup: "TODO" as const,
            },
            dependencyId,
            createdAt: "2026-10-10T10:00:00.000Z",
          },
          {
            id: "card-uuid-3",
            cardKey: "NEX-3",
            title: "Done Task",
            list: {
              id: "list-3",
              name: "Done",
              statusGroup: "DONE" as const,
            },
            dependencyId: "dep-uuid-100",
            createdAt: "2026-10-10T10:05:00.000Z",
          },
        ];

        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: {
            success: true,
            data: { prerequisites: mockPrerequisites },
          },
        });

        const result = await cardApi.getCardDependencies(cardId);
        expect(apiClient.get).toHaveBeenCalledWith(`/cards/${cardId}/dependencies`);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: dependencyId,
          cardId,
          prerequisiteCardId: depCardId,
          prerequisiteCode: "NEX-2",
          prerequisiteTitle: "Prerequisite Task",
          prerequisiteStatus: "TODO",
          isCompleted: false,
        });
        expect(result[1].isCompleted).toBe(true);
      });

      it("returns empty array if prerequisites is empty or null", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: { success: true, data: { prerequisites: [] } },
        });

        const result = await cardApi.getCardDependencies(cardId);
        expect(result).toEqual([]);
      });

      it("propagates API error when fetching dependencies fails", async () => {
        const error = new ApiError("Failed to fetch dependencies", "INTERNAL_ERROR", 500);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.getCardDependencies(cardId)).rejects.toThrow(error);
      });
    });

    describe("addDependency", () => {
      it("rejects self-dependency locally without making HTTP request", async () => {
        const postSpy = vi.spyOn(apiClient, "post");

        await expect(
          cardApi.addDependency(cardId, { dependsOnCardId: cardId })
        ).rejects.toThrow("Cannot depend on self");

        expect(postSpy).not.toHaveBeenCalled();
      });

      it("creates dependency via POST and refreshes prerequisites", async () => {
        const mockCreated = {
          id: dependencyId,
          cardId,
          dependsOnCardId: depCardId,
          createdAt: "2026-10-10T12:00:00.000Z",
        };

        const mockPrerequisites = [
          {
            id: depCardId,
            cardKey: "NEX-2",
            title: "Prerequisite Task",
            list: {
              id: "list-1",
              name: "To Do",
              statusGroup: "TODO" as const,
            },
            dependencyId,
            createdAt: "2026-10-10T12:00:00.000Z",
          },
        ];

        vi.spyOn(apiClient, "post").mockResolvedValueOnce({
          data: { success: true, data: mockCreated },
        });
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: { success: true, data: { prerequisites: mockPrerequisites } },
        });

        const result = await cardApi.addDependency(cardId, {
          dependsOnCardId: depCardId,
        });

        expect(apiClient.post).toHaveBeenCalledWith(`/cards/${cardId}/dependencies`, {
          dependsOnCardId: depCardId,
        });
        expect(apiClient.get).toHaveBeenCalledWith(`/cards/${cardId}/dependencies`);
        expect(result.id).toBe(dependencyId);
        expect(result.prerequisiteCardId).toBe(depCardId);
        expect(result.prerequisiteCode).toBe("NEX-2");
      });

      it("propagates 400 validation error (e.g., cross-board dependency)", async () => {
        const error = new ApiError("Cannot depend on cards from other boards", "VALIDATION_ERROR", 400);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(
          cardApi.addDependency(cardId, { dependsOnCardId: depCardId })
        ).rejects.toThrow(error);
      });

      it("propagates 403 forbidden error when user lacks permission", async () => {
        const error = new ApiError("Permission denied", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(
          cardApi.addDependency(cardId, { dependsOnCardId: depCardId })
        ).rejects.toThrow(error);
      });

      it("propagates 409 conflict error when dependency creates a cycle or is duplicate", async () => {
        const error = new ApiError("Circular dependency detected", "DEPENDENCY_CYCLE", 409);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(
          cardApi.addDependency(cardId, { dependsOnCardId: depCardId })
        ).rejects.toThrow(error);
      });
    });

    describe("deleteDependency", () => {
      it("deletes dependency via DELETE /cards/:cardId/dependencies/:dependencyId", async () => {
        vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
          data: { success: true, data: {} },
        });

        await cardApi.deleteDependency(cardId, dependencyId);
        expect(apiClient.delete).toHaveBeenCalledWith(
          `/cards/${cardId}/dependencies/${dependencyId}`
        );
      });

      it("propagates 403/404 errors on deletion failure", async () => {
        const error = new ApiError("Dependency not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "delete").mockRejectedValueOnce(error);

        await expect(cardApi.deleteDependency(cardId, dependencyId)).rejects.toThrow(error);
      });
    });
  });

  describe("Card Activity Logs Integration API (Task B)", () => {
    const cardId = "card-uuid-1";

    const mockActivitiesDto = [
      {
        id: "act-1",
        boardId: "board-1",
        cardId,
        actorId: "user-1",
        action: "CARD_CREATED",
        createdAt: "2026-10-10T09:00:00.000Z",
      },
      {
        id: "act-2",
        boardId: "board-1",
        cardId,
        actorId: "user-2",
        action: "CARD_MOVED",
        details: { fromList: "To Do", toList: "In Progress" },
        createdAt: "2026-10-10T10:00:00.000Z",
      },
    ];

    it("fetches first page without cursor via GET /cards/:cardId/activity", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockActivitiesDto,
          nextCursor: "cursor-token-abc",
        },
      });

      const result = await cardApi.getCardActivities(cardId, { limit: 20 });
      expect(apiClient.get).toHaveBeenCalledWith(`/cards/${cardId}/activity`, {
        params: { limit: 20 },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items[0].action).toBe("created this card");
      expect(result.items[1].action).toBe("moved this card");
      expect(result.nextCursor).toBe("cursor-token-abc");
    });

    it("fetches subsequent page with cursor and limit", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockActivitiesDto[0]],
          nextCursor: null,
        },
      });

      const result = await cardApi.getCardActivities(cardId, {
        limit: 10,
        cursor: "cursor-token-abc",
      });

      expect(apiClient.get).toHaveBeenCalledWith(`/cards/${cardId}/activity`, {
        params: { limit: 10, cursor: "cursor-token-abc" },
      });
      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
    });

    it("maps actor info from membersPool when available", async () => {
      const membersPool = [
        {
          id: "user-1",
          name: "Nguyen Van A",
          initials: "NA",
          role: "MEMBER" as const,
        },
      ];

      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockActivitiesDto[0]],
          nextCursor: null,
        },
      });

      const result = await cardApi.getCardActivities(cardId, {}, membersPool);
      expect(result.items[0].user).toEqual({
        id: "user-1",
        name: "Nguyen Van A",
        initials: "NA",
        role: "MEMBER",
      });
    });


    it("propagates error when activity fetch fails", async () => {
      const error = new ApiError("Failed to load activity logs", "INTERNAL_ERROR", 500);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

      await expect(cardApi.getCardActivities(cardId)).rejects.toThrow(error);
    });
  });


  describe("Card Comments Integration API (Step 6E)", () => {
    const cardId = "card-uuid-1";
    const commentId = "comment-uuid-10";

    describe("getCardComments", () => {
      it("fetches comments for a card via GET /cards/:cardId/comments", async () => {
        const mockComments = [
          {
            id: commentId,
            cardId,
            userId: "user-1",
            content: "Initial remark",
            createdAt: "2026-10-10T10:00:00.000Z",
            updatedAt: "2026-10-10T10:00:00.000Z",
            deletedAt: null,
          },
          {
            id: "comment-uuid-11",
            cardId,
            userId: "user-2",
            content: null,
            createdAt: "2026-10-10T11:00:00.000Z",
            updatedAt: "2026-10-10T11:05:00.000Z",
            deletedAt: "2026-10-10T11:05:00.000Z",
          },
        ];

        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: { success: true, data: mockComments },
        });

        const result = await cardApi.getCardComments(cardId);
        expect(apiClient.get).toHaveBeenCalledWith(`/cards/${cardId}/comments`);
        expect(result).toEqual(mockComments);
      });

      it("returns empty array if data is null or empty", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: { success: true, data: null },
        });

        const result = await cardApi.getCardComments(cardId);
        expect(result).toEqual([]);
      });

      it("propagates error when GET fails", async () => {
        const error = new ApiError("Forbidden board access", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.getCardComments(cardId)).rejects.toThrow(error);
      });
    });

    describe("createCardComment", () => {
      it("creates a comment via POST /cards/:cardId/comments with trimmed content", async () => {
        const createdDto = {
          id: commentId,
          cardId,
          userId: "user-1",
          content: "Valid comment text",
          createdAt: "2026-10-10T10:00:00.000Z",
          updatedAt: "2026-10-10T10:00:00.000Z",
          deletedAt: null,
        };

        vi.spyOn(apiClient, "post").mockResolvedValueOnce({
          data: { success: true, data: createdDto },
        });

        const result = await cardApi.createCardComment(cardId, "  Valid comment text  ");
        expect(apiClient.post).toHaveBeenCalledWith(`/cards/${cardId}/comments`, {
          content: "Valid comment text",
        });
        expect(result).toEqual(createdDto);
      });

      it("propagates 400 MENTION_INVALID error from backend", async () => {
        const error = new ApiError("Mentioned user not in board", "MENTION_INVALID", 400);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.createCardComment(cardId, "@unknown-user")).rejects.toThrow(error);
      });
    });

    describe("updateCardComment", () => {
      it("updates a comment via PATCH /comments/:commentId with trimmed content", async () => {
        const updatedDto = {
          id: commentId,
          cardId,
          userId: "user-1",
          content: "Updated content",
          createdAt: "2026-10-10T10:00:00.000Z",
          updatedAt: "2026-10-10T10:10:00.000Z",
          deletedAt: null,
        };

        vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
          data: { success: true, data: updatedDto },
        });

        const result = await cardApi.updateCardComment(commentId, "  Updated content  ");
        expect(apiClient.patch).toHaveBeenCalledWith(`/comments/${commentId}`, {
          content: "Updated content",
        });
        expect(result).toEqual(updatedDto);
      });

      it("propagates 403 FORBIDDEN when non-author attempts edit", async () => {
        const error = new ApiError("Forbidden - not comment author", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "patch").mockRejectedValueOnce(error);

        await expect(cardApi.updateCardComment(commentId, "Unauthorized edit")).rejects.toThrow(error);
      });
    });

    describe("deleteCardComment", () => {
      it("deletes a comment via DELETE /comments/:commentId", async () => {
        vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
          data: { success: true, data: {} },
        });

        await cardApi.deleteCardComment(commentId);
        expect(apiClient.delete).toHaveBeenCalledWith(`/comments/${commentId}`);
      });

      it("propagates 403 FORBIDDEN when non-author attempts deletion", async () => {
        const error = new ApiError("Forbidden - not comment author", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "delete").mockRejectedValueOnce(error);

        await expect(cardApi.deleteCardComment(commentId)).rejects.toThrow(error);
      });
    });
  });

  describe("Card Attachments Integration API (Step 6F)", () => {
    const cardId = "card-uuid-1";
    const attachmentId = "attachment-uuid-10";

    describe("getCardAttachments", () => {
      it("fetches attachments for a card via GET /cards/:cardId/attachments", async () => {
        const mockAttachments = [
          {
            id: attachmentId,
            cardId,
            userId: "user-1",
            fileName: "architecture.pdf",
            fileSize: 1048576,
            mimeType: "application/pdf",
            createdAt: "2026-10-10T10:00:00.000Z",
          },
        ];

        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: { success: true, data: mockAttachments },
        });

        const result = await cardApi.getCardAttachments(cardId);
        expect(apiClient.get).toHaveBeenCalledWith(`/cards/${cardId}/attachments`);
        expect(result).toEqual(mockAttachments);
      });

      it("returns empty array when data is null or empty", async () => {
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: { success: true, data: null },
        });

        const result = await cardApi.getCardAttachments(cardId);
        expect(result).toEqual([]);
      });

      it("propagates error when GET fails", async () => {
        const error = new ApiError("Forbidden board access", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.getCardAttachments(cardId)).rejects.toThrow(error);
      });
    });

    describe("uploadCardAttachment", () => {
      it("uploads raw binary file via POST /cards/:cardId/attachments with required headers", async () => {
        const file = new File(["test-content"], "report.pdf", { type: "application/pdf" });
        const createdDto = {
          id: attachmentId,
          cardId,
          userId: "user-1",
          fileName: "report.pdf",
          fileSize: 12,
          mimeType: "application/pdf",
          createdAt: "2026-10-10T10:00:00.000Z",
        };

        vi.spyOn(apiClient, "post").mockResolvedValueOnce({
          data: { success: true, data: createdDto },
        });

        const result = await cardApi.uploadCardAttachment(cardId, file);
        expect(apiClient.post).toHaveBeenCalledWith(
          `/cards/${cardId}/attachments`,
          file,
          {
            headers: {
              "Content-Type": "application/pdf",
              "x-file-name": "report.pdf",
            },
            timeout: 60000,
          }
        );
        expect(result).toEqual(createdDto);
      });

      it("passes Vietnamese Unicode filename with characters đ, ơ, ư in x-file-name to apiClient", async () => {
        const unicodeFileName = "Kế hoạch kiểm thử đồ án hướng đối tượng.pdf";
        const file = new File(["test-content"], unicodeFileName, { type: "application/pdf" });
        const createdDto = {
          id: attachmentId,
          cardId,
          userId: "user-1",
          fileName: unicodeFileName,
          fileSize: 12,
          mimeType: "application/pdf",
          createdAt: "2026-10-10T10:00:00.000Z",
        };

        vi.spyOn(apiClient, "post").mockResolvedValueOnce({
          data: { success: true, data: createdDto },
        });

        const result = await cardApi.uploadCardAttachment(cardId, file);
        expect(apiClient.post).toHaveBeenCalledWith(
          `/cards/${cardId}/attachments`,
          file,
          {
            headers: {
              "Content-Type": "application/pdf",
              "x-file-name": unicodeFileName,
            },
            timeout: 60000,
          }
        );
        expect(result).toEqual(createdDto);
      });

      it("propagates 413 PAYLOAD_TOO_LARGE error when file exceeds 25MB", async () => {
        const file = new File(["test-content"], "huge.pdf", { type: "application/pdf" });
        const error = new ApiError("Dung lượng tệp đính kèm tối đa là 25MB", "PAYLOAD_TOO_LARGE", 413);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.uploadCardAttachment(cardId, file)).rejects.toThrow(error);
      });

      it("propagates 400 ATTACHMENT_TYPE_INVALID error for unsupported file type", async () => {
        const file = new File(["test-content"], "script.sh", { type: "application/x-sh" });
        const error = new ApiError("Định dạng tệp không hợp lệ", "ATTACHMENT_TYPE_INVALID", 400);
        vi.spyOn(apiClient, "post").mockRejectedValueOnce(error);

        await expect(cardApi.uploadCardAttachment(cardId, file)).rejects.toThrow(error);
      });
    });

    describe("downloadCardAttachment", () => {
      it("downloads raw binary blob via GET /attachments/:attachmentId/content", async () => {
        const mockBlob = new Blob(["binary-content"], { type: "application/pdf" });
        vi.spyOn(apiClient, "get").mockResolvedValueOnce({
          data: mockBlob,
        });

        const result = await cardApi.downloadCardAttachment(attachmentId);
        expect(apiClient.get).toHaveBeenCalledWith(`/attachments/${attachmentId}/content`, {
          responseType: "blob",
        });
        expect(result).toEqual(mockBlob);
      });

      it("propagates error on download failure", async () => {
        const error = new ApiError("Attachment not found", "NOT_FOUND", 404);
        vi.spyOn(apiClient, "get").mockRejectedValueOnce(error);

        await expect(cardApi.downloadCardAttachment(attachmentId)).rejects.toThrow(error);
      });
    });

    describe("deleteCardAttachment", () => {
      it("deletes attachment via DELETE /attachments/:attachmentId", async () => {
        vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
          data: { success: true, data: {} },
        });

        await cardApi.deleteCardAttachment(attachmentId);
        expect(apiClient.delete).toHaveBeenCalledWith(`/attachments/${attachmentId}`);
      });

      it("propagates 403 FORBIDDEN when user is not authorized to delete", async () => {
        const error = new ApiError("Forbidden", "FORBIDDEN", 403);
        vi.spyOn(apiClient, "delete").mockRejectedValueOnce(error);

        await expect(cardApi.deleteCardAttachment(attachmentId)).rejects.toThrow(error);
      });
    });
  });
});

