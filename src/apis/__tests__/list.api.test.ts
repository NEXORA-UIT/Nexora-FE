import { describe, it, expect, vi, beforeEach } from "vitest";
import { listApi } from "../list.api";
import { apiClient, ApiError } from "../client";
import type { ListDto } from "@/types";

describe("listApi Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockListDto1: ListDto = {
    id: "list-1",
    boardId: "board-1",
    name: "To Do",
    statusGroup: "TODO",
    position: 1024,
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:30:00.000Z",
  };

  const mockListDto2: ListDto = {
    id: "list-2",
    boardId: "board-1",
    name: "In Progress",
    statusGroup: "IN_PROGRESS",
    position: 2048,
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T08:30:00.000Z",
  };

  const mockArchivedListDto: ListDto = {
    id: "list-3",
    boardId: "board-1",
    name: "Old Items",
    statusGroup: "DONE",
    position: 3072,
    archivedAt: "2026-10-10T09:00:00.000Z",
    createdAt: "2026-10-08T08:00:00.000Z",
    updatedAt: "2026-10-10T09:00:00.000Z",
  };

  describe("listApi.getBoardLists", () => {
    it("requests GET /boards/:boardId/lists with undefined params by default and maps to KanbanList[]", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockListDto1, mockListDto2],
        },
      });

      const result = await listApi.getBoardLists("board-1");

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/lists", {
        params: undefined,
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "list-1",
        boardId: "board-1",
        name: "To Do",
        category: "TODO",
        position: 1024,
        status: "ACTIVE",
        cards: [],
        createdAt: "2026-10-09T08:00:00.000Z",
        updatedAt: "2026-10-09T08:30:00.000Z",
      });
      expect(result[1].category).toBe("IN_PROGRESS");
      expect(result[1].status).toBe("ACTIVE");
    });

    it("sends includeArchived='true' parameter when requested", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockListDto1, mockArchivedListDto],
        },
      });

      const result = await listApi.getBoardLists("board-1", { includeArchived: true });

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/lists", {
        params: { includeArchived: "true" },
      });
      expect(result).toHaveLength(2);
      expect(result[1].status).toBe("ARCHIVED");
      expect(result[1].category).toBe("DONE");
    });

    it("sends includeArchived='false' parameter when explicitly set to false", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockListDto1],
        },
      });

      const result = await listApi.getBoardLists("board-1", { includeArchived: false });

      expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/lists", {
        params: { includeArchived: "false" },
      });
      expect(result).toHaveLength(1);
    });

    it("propagates API errors without silently falling back to mock lists", async () => {
      const mockError = new ApiError("Board not found", "NOT_FOUND", 404);
      vi.spyOn(apiClient, "get").mockRejectedValueOnce(mockError);

      await expect(listApi.getBoardLists("unknown-board")).rejects.toThrow(mockError);
    });
  });

  describe("listApi.createList", () => {
    it("sends POST /boards/:boardId/lists with { name, statusGroup } and maps response to KanbanList", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockListDto1,
        },
      });

      const result = await listApi.createList("board-1", {
        name: "  To Do  ",
        category: "TODO",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/boards/board-1/lists", {
        name: "To Do",
        statusGroup: "TODO",
      });
      expect(result.id).toBe("list-1");
      expect(result.name).toBe("To Do");
      expect(result.category).toBe("TODO");
      expect(result.status).toBe("ACTIVE");
    });

    it("accepts statusGroup directly in payload if provided", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: {
          success: true,
          data: mockListDto2,
        },
      });

      const result = await listApi.createList("board-1", {
        name: "In Progress",
        statusGroup: "IN_PROGRESS",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/boards/board-1/lists", {
        name: "In Progress",
        statusGroup: "IN_PROGRESS",
      });
      expect(result.category).toBe("IN_PROGRESS");
    });

    it("propagates 409 conflict error when board has reached 30 active lists limit", async () => {
      const mockError = new ApiError("Board đã đạt giới hạn 30 List đang hoạt động", "CONFLICT", 409);
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(mockError);

      await expect(
        listApi.createList("board-1", { name: "Overflow", category: "TODO" })
      ).rejects.toThrow(mockError);
    });
  });

  describe("listApi.updateList", () => {
    it("sends PATCH /lists/:id with updated name and mapped statusGroup", async () => {
      const updatedDto: ListDto = {
        ...mockListDto1,
        name: "Ready for Dev",
        statusGroup: "IN_PROGRESS",
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: updatedDto,
        },
      });

      const result = await listApi.updateList("list-1", {
        name: "Ready for Dev",
        category: "IN_PROGRESS",
      });

      expect(apiClient.patch).toHaveBeenCalledWith("/lists/list-1", {
        name: "Ready for Dev",
        statusGroup: "IN_PROGRESS",
      });
      expect(result.name).toBe("Ready for Dev");
      expect(result.category).toBe("IN_PROGRESS");
    });

    it("sends partial payload when only name is provided", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockListDto1, name: "Renamed" },
        },
      });

      const result = await listApi.updateList("list-1", { name: "Renamed" });

      expect(apiClient.patch).toHaveBeenCalledWith("/lists/list-1", {
        name: "Renamed",
      });
      expect(result.name).toBe("Renamed");
    });

    it("propagates 400 validation error when empty payload is passed", async () => {
      const mockError = new ApiError("Phải có ít nhất một trường cần cập nhật", "VALIDATION_ERROR", 400);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(listApi.updateList("list-1", {})).rejects.toThrow(mockError);
    });
  });

  describe("listApi.reorderList", () => {
    it("sends PATCH /lists/:id/position with { position } and maps returned list", async () => {
      const reorderedDto: ListDto = {
        ...mockListDto1,
        position: 4096,
      };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: reorderedDto,
        },
      });

      const result = await listApi.reorderList("list-1", 4096);

      expect(apiClient.patch).toHaveBeenCalledWith("/lists/list-1/position", {
        position: 4096,
      });
      expect(result.position).toBe(4096);
    });

    it("propagates API error when reorder fails", async () => {
      const mockError = new ApiError("Forbidden", "FORBIDDEN", 403);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(listApi.reorderList("list-1", 1024)).rejects.toThrow(mockError);
    });
  });

  describe("listApi.archiveList", () => {
    it("sends PATCH /lists/:id/archive with empty object by default", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await listApi.archiveList("list-1");

      expect(apiClient.patch).toHaveBeenCalledWith("/lists/list-1/archive", {});
    });

    it("sends PATCH /lists/:id/archive with { archiveCards: true } when archiving cards together", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await listApi.archiveList("list-1", { archiveCards: true });

      expect(apiClient.patch).toHaveBeenCalledWith("/lists/list-1/archive", {
        archiveCards: true,
      });
    });

    it("sends PATCH /lists/:id/archive with { moveCardsToListId } when moving cards to target list", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await listApi.archiveList("list-1", { moveCardsToListId: "list-2" });

      expect(apiClient.patch).toHaveBeenCalledWith("/lists/list-1/archive", {
        moveCardsToListId: "list-2",
      });
    });

    it("propagates 409 conflict error when active cards exist without strategy", async () => {
      const mockError = new ApiError(
        "List còn Card đang hoạt động; hãy chuyển Card hoặc lưu trữ chúng cùng List",
        "CONFLICT",
        409
      );
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(listApi.archiveList("list-1")).rejects.toThrow(mockError);
    });
  });

  describe("listApi.restoreList", () => {
    it("sends PATCH /lists/:id/restore with no request body", async () => {
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      });

      await listApi.restoreList("list-3");

      expect(apiClient.patch).toHaveBeenCalledWith("/lists/list-3/restore");
    });

    it("propagates 409 conflict error when board already has 30 active lists on restore", async () => {
      const mockError = new ApiError(
        "Không thể khôi phục: Board đã có 30 List đang hoạt động",
        "CONFLICT",
        409
      );
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(mockError);

      await expect(listApi.restoreList("list-3")).rejects.toThrow(mockError);
    });
  });
});
