import { describe, it, expect, vi, beforeEach } from "vitest";
import { boardApi } from "../board.api";
import { apiClient, ApiError } from "../client";
import type { BoardDto } from "@/types";

describe("boardApi Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBoardDto: BoardDto = {
    id: "board-uuid-1",
    workspaceId: "ws-uuid-1",
    name: "Engineering Kanban",
    description: "Core sprint tracking board",
    coverColor: "#3B82F6",
    coverUrl: "https://example.com/cover.png",
    status: "ACTIVE",
    pmId: "user-pm-1",
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T09:30:00.000Z",
  };

  const mockArchivedBoardDto: BoardDto = {
    id: "board-uuid-2",
    workspaceId: "ws-uuid-1",
    name: "Legacy Migration",
    description: null,
    coverColor: null,
    coverUrl: null,
    status: "ARCHIVED",
    pmId: null,
    archivedAt: "2026-10-09T12:00:00.000Z",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-09T12:00:00.000Z",
  };

  describe("boardApi.getBoards", () => {
    it("requests GET /workspaces/:workspaceId/boards with undefined params by default and maps data", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockBoardDto],
        },
      });

      const result = await boardApi.getBoards("ws-uuid-1");

      expect(apiClient.get).toHaveBeenCalledWith("/workspaces/ws-uuid-1/boards", {
        params: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("board-uuid-1");
      expect(result[0].title).toBe("Engineering Kanban");
      expect(result[0].status).toBe("active");
      expect(result[0].openTasksCount).toBeUndefined();
      expect(result[0].completedPercent).toBeUndefined();
    });

    it("serializes includeArchived: true as query parameter string 'true'", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockBoardDto, mockArchivedBoardDto],
        },
      });

      const result = await boardApi.getBoards("ws-uuid-1", {
        includeArchived: true,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/workspaces/ws-uuid-1/boards", {
        params: { includeArchived: "true" },
      });
      expect(result).toHaveLength(2);
      expect(result[1].id).toBe("board-uuid-2");
      expect(result[1].status).toBe("archived");
    });

    it("serializes includeArchived: false as query parameter string 'false'", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockBoardDto],
        },
      });

      await boardApi.getBoards("ws-uuid-1", {
        includeArchived: false,
      });

      expect(apiClient.get).toHaveBeenCalledWith("/workspaces/ws-uuid-1/boards", {
        params: { includeArchived: "false" },
      });
    });

    it("handles empty board list response gracefully", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
        },
      });

      const result = await boardApi.getBoards("ws-uuid-1");
      expect(result).toEqual([]);
    });

    it("re-throws error without falling back to mock data", async () => {
      const apiError = new ApiError("Workspace not found", "NOT_FOUND", 404);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(apiError);

      await expect(boardApi.getBoards("ws-uuid-not-found")).rejects.toThrow(
        apiError
      );
    });
  });

  describe("boardApi.getBoard", () => {
    it("requests GET /boards/:id and maps response DTO to Board model", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardDto,
        },
      });

      const result = await boardApi.getBoard("board-uuid-1");

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-uuid-1");
      expect(result.id).toBe("board-uuid-1");
      expect(result.title).toBe("Engineering Kanban");
      expect(result.name).toBe("Engineering Kanban");
      expect(result.status).toBe("active");
      expect(result.description).toBe("Core sprint tracking board");
      expect(result.openTasksCount).toBeUndefined();
      expect(result.completedPercent).toBeUndefined();
    });

    it("re-throws error without falling back to mock data", async () => {
      const apiError = new ApiError("Board not found", "NOT_FOUND", 404);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(apiError);

      await expect(boardApi.getBoard("non-existent-board")).rejects.toThrow(
        apiError
      );
    });
  });

  describe("boardApi.getBoardMembers", () => {
    const mockMemberDto = {
      id: "mem-uuid-1",
      boardId: "board-uuid-1",
      userId: "user-uuid-1",
      role: "PM" as const,
      createdAt: "2026-10-09T08:00:00.000Z",
      user: {
        id: "user-uuid-1",
        email: "alice@example.com",
        fullName: "Alice Wonderland",
        avatarUrl: "https://example.com/avatar.png",
      },
    };

    it("requests GET /boards/:id/members and maps response DTOs to BoardMember models", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockMemberDto],
        },
      });

      const result = await boardApi.getBoardMembers("board-uuid-1");

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-uuid-1/members");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "user-uuid-1",
        name: "Alice Wonderland",
        initials: "AW",
        avatarUrl: "https://example.com/avatar.png",
        role: "PM",
      });
    });

    it("handles empty member list gracefully", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
        },
      });

      const result = await boardApi.getBoardMembers("board-uuid-1");
      expect(result).toEqual([]);
    });

    it("re-throws error without returning fake mock data or empty array on failure", async () => {
      const apiError = new ApiError("Forbidden", "FORBIDDEN", 403);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(apiError);

      await expect(boardApi.getBoardMembers("board-uuid-1")).rejects.toThrow(
        apiError
      );
    });
  });

  describe("boardApi.createBoard", () => {
    it("sends POST /workspaces/:workspaceId/boards with sanitized payload and maps created board", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardDto,
        },
      });

      const input = {
        workspaceId: "ws-uuid-1",
        title: "Engineering Kanban",
        description: "Core sprint tracking board",
      };

      const result = await boardApi.createBoard(input);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/workspaces/ws-uuid-1/boards",
        {
          name: "Engineering Kanban",
          description: "Core sprint tracking board",
        }
      );
      expect(result.id).toBe("board-uuid-1");
      expect(result.status).toBe("active");
    });

    it("sends payload with canonical name and strictly omits title from outgoing HTTP request", async () => {
      const postSpy = vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardDto,
        },
      });

      await boardApi.createBoard({
        workspaceId: "ws-uuid-1",
        name: "Canonical Board Name",
        title: "Legacy Fallback Title",
        description: "Valid description",
      });

      expect(postSpy).toHaveBeenCalledTimes(1);
      const [endpoint, payload] = postSpy.mock.calls[0];
      expect(endpoint).toBe("/workspaces/ws-uuid-1/boards");
      expect(payload).toEqual({
        name: "Canonical Board Name",
        description: "Valid description",
      });
      expect(payload).not.toHaveProperty("title");
    });

    it("throws an error and prevents HTTP request when board name is empty or whitespace", async () => {
      const postSpy = vi.spyOn(apiClient, "post");

      await expect(
        boardApi.createBoard({
          workspaceId: "ws-uuid-1",
          name: "   ",
        })
      ).rejects.toThrow("Board name is required and cannot be empty.");

      expect(postSpy).not.toHaveBeenCalled();
    });

    it("supports direct workspaceId and payload call signature", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardDto,
        },
      });

      const result = await boardApi.createBoard("ws-uuid-1", {
        name: "Engineering Kanban",
        description: "Core sprint tracking board",
        coverColor: "#3B82F6",
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        "/workspaces/ws-uuid-1/boards",
        {
          name: "Engineering Kanban",
          description: "Core sprint tracking board",
          coverColor: "#3B82F6",
        }
      );
      expect(result.id).toBe("board-uuid-1");
    });

    it("throws an error when workspaceId is passed as string without payload", async () => {
      await expect(boardApi.createBoard("ws-uuid-1")).rejects.toThrow(
        "Board creation payload is required when specifying workspaceId."
      );
    });

    it("re-throws ApiError when board creation fails (e.g. frozen workspace)", async () => {
      const apiError = new ApiError("Workspace is frozen", "WORKSPACE_FROZEN", 403);
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(apiError);

      await expect(
        boardApi.createBoard({
          workspaceId: "ws-frozen",
          title: "New Board",
        })
      ).rejects.toThrow(apiError);
    });
  });

  describe("boardApi.updateBoard", () => {
    it("sends PATCH /boards/:id with update payload and maps updated board", async () => {
      const updatedDto = { ...mockBoardDto, name: "Updated Kanban Board" };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: updatedDto,
        },
      });

      const result = await boardApi.updateBoard("board-uuid-1", {
        name: "Updated Kanban Board",
      });

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/boards/board-uuid-1",
        { name: "Updated Kanban Board" }
      );
      expect(result.title).toBe("Updated Kanban Board");
    });

    it("re-throws ApiError when update fails", async () => {
      const apiError = new ApiError("Forbidden", "FORBIDDEN", 403);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(apiError);

      await expect(
        boardApi.updateBoard("board-uuid-1", { name: "Forbidden Name" })
      ).rejects.toThrow(apiError);
    });
  });

  describe("boardApi.archiveBoard", () => {
    it("sends PATCH /boards/:id/archive without body", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await boardApi.archiveBoard("board-uuid-1");

      expect(apiClient.patch).toHaveBeenCalledWith("/boards/board-uuid-1/archive");
    });

    it("re-throws ApiError when archive fails", async () => {
      const apiError = new ApiError("Forbidden", "FORBIDDEN", 403);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(apiError);

      await expect(boardApi.archiveBoard("board-uuid-1")).rejects.toThrow(
        apiError
      );
    });
  });

  describe("boardApi.restoreBoard", () => {
    it("sends PATCH /boards/:id/unarchive (specifically /unarchive, NOT /restore)", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await boardApi.restoreBoard("board-uuid-2");

      expect(apiClient.patch).toHaveBeenCalledWith(
        "/boards/board-uuid-2/unarchive"
      );
    });

    it("re-throws ApiError when restore fails", async () => {
      const apiError = new ApiError("Workspace is frozen", "WORKSPACE_FROZEN", 403);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(apiError);

      await expect(boardApi.restoreBoard("board-uuid-2")).rejects.toThrow(
        apiError
      );
    });
  });

  describe("boardApi.deleteBoard", () => {
    it("sends DELETE /boards/:id with confirmationName in config.data", async () => {
      vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await boardApi.deleteBoard("board-uuid-2", "Legacy Migration");

      expect(apiClient.delete).toHaveBeenCalledWith("/boards/board-uuid-2", {
        data: { confirmationName: "Legacy Migration" },
      });
    });

    it("supports object payload confirmationName parameter", async () => {
      vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await boardApi.deleteBoard("board-uuid-2", {
        confirmationName: "Legacy Migration",
      });

      expect(apiClient.delete).toHaveBeenCalledWith("/boards/board-uuid-2", {
        data: { confirmationName: "Legacy Migration" },
      });
    });

    it("re-throws ApiError when deletion fails (e.g. non-archived conflict)", async () => {
      const apiError = new ApiError(
        "Only archived boards can be permanently deleted",
        "CONFLICT",
        409
      );
      vi.spyOn(apiClient, "delete").mockRejectedValueOnce(apiError);

      await expect(
        boardApi.deleteBoard("board-uuid-1", "Engineering Kanban")
      ).rejects.toThrow(apiError);
    });
  });

  describe("boardApi.assignBoardPm", () => {
    it("sends PATCH /boards/:id/pm with pmId payload", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await boardApi.assignBoardPm("board-uuid-1", "user-pm-123");

      expect(apiClient.patch).toHaveBeenCalledWith("/boards/board-uuid-1/pm", {
        pmId: "user-pm-123",
      });
    });

    it("re-throws ApiError when assigning PM fails (e.g. not workspace owner)", async () => {
      const apiError = new ApiError("Forbidden", "FORBIDDEN", 403);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(apiError);

      await expect(
        boardApi.assignBoardPm("board-uuid-1", "user-pm-123")
      ).rejects.toThrow(apiError);
    });
  });

  describe("boardApi.getBoardDashboard", () => {
    const mockDashboardDto = {
      totalCards: 12,
      todo: 3,
      inProgress: 5,
      done: 4,
      overdue: 2,
      completionPercent: 33,
    };

    it("requests GET /boards/:id/dashboard and maps metrics to domain model", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockDashboardDto,
        },
      });

      const dashboard = await boardApi.getBoardDashboard("board-uuid-1");

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-uuid-1/dashboard");
      expect(dashboard).toEqual({
        totalCards: 12,
        todoCards: 3,
        inProgressCards: 5,
        completedCards: 4,
        overdueCards: 2,
        completionRate: 33,
      });
    });

    it("handles empty board with zero metrics", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            totalCards: 0,
            todo: 0,
            inProgress: 0,
            done: 0,
            overdue: 0,
            completionPercent: 0,
          },
        },
      });

      const dashboard = await boardApi.getBoardDashboard("board-empty");

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-empty/dashboard");
      expect(dashboard).toEqual({
        totalCards: 0,
        todoCards: 0,
        inProgressCards: 0,
        completedCards: 0,
        overdueCards: 0,
        completionRate: 0,
      });
    });

    it("propagates ApiError when GET /boards/:id/dashboard fails", async () => {
      const apiError = new ApiError("Board not found", "BOARD_NOT_FOUND", 404);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(apiError);

      await expect(
        boardApi.getBoardDashboard("board-not-found")
      ).rejects.toThrow(apiError);
    });
  });
});
