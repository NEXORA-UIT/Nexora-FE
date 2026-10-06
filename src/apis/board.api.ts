import type { Board, CreateBoardInput } from "@/types";
import { MOCK_BOARDS } from "@/mocks/data/boards.mock";

// In-memory working copy to simulate state persistence across client interactions
let inMemoryBoards: Board[] = [...MOCK_BOARDS];

export const boardApi = {
  /**
   * Retrieves all boards in a given workspace
   * (Mock implementation ready for GET /api/v1/workspaces/:workspaceId/boards)
   */
  async getBoards(workspaceId: string = "ws-core-platform"): Promise<Board[]> {
    return inMemoryBoards.filter((b) => b.workspaceId === workspaceId);
  },

  /**
   * Creates a new board in a given workspace
   * (Mock implementation ready for POST /api/v1/workspaces/:workspaceId/boards)
   */
  async createBoard(payload: CreateBoardInput): Promise<Board> {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      workspaceId: payload.workspaceId,
      title: payload.title.trim(),
      description: payload.description?.trim() || "New project board",
      status: "active",
      openTasksCount: 0,
      completedPercent: 0,
      members: [{ id: "m-current", name: "Current User", initials: "Đ" }],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    inMemoryBoards = [newBoard, ...inMemoryBoards];
    return newBoard;
  },

  /**
   * Archives an active board
   * (Mock implementation ready for PATCH /api/v1/boards/:id/archive)
   */
  async archiveBoard(boardId: string): Promise<Board> {
    const target = inMemoryBoards.find((b) => b.id === boardId);
    if (!target) {
      throw new Error(`Board not found: ${boardId}`);
    }

    const updated: Board = {
      ...target,
      status: "archived",
      updatedAt: new Date().toISOString(),
    };

    inMemoryBoards = inMemoryBoards.map((b) => (b.id === boardId ? updated : b));
    return updated;
  },

  /**
   * Restores an archived board to active status
   * (Mock implementation ready for PATCH /api/v1/boards/:id/restore)
   */
  async restoreBoard(boardId: string): Promise<Board> {
    const target = inMemoryBoards.find((b) => b.id === boardId);
    if (!target) {
      throw new Error(`Board not found: ${boardId}`);
    }

    const updated: Board = {
      ...target,
      status: "active",
      updatedAt: new Date().toISOString(),
    };

    inMemoryBoards = inMemoryBoards.map((b) => (b.id === boardId ? updated : b));
    return updated;
  },

  /**
   * Deletes a board
   * (Mock implementation ready for DELETE /api/v1/boards/:id with ConfirmDeleteBoardRequest)
   */
  async deleteBoard(boardId: string, confirmationName?: string): Promise<void> {
    const target = inMemoryBoards.find((b) => b.id === boardId);
    if (confirmationName && target) {
      const actualName = target.name || target.title;
      if (confirmationName.trim().toLowerCase() !== actualName.trim().toLowerCase()) {
        throw new Error("Confirmation name does not match board name.");
      }
    }
    inMemoryBoards = inMemoryBoards.filter((b) => b.id !== boardId);
  },
};
