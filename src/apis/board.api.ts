import type { Board, BoardDetail, CreateBoardInput, BoardDashboard } from "@/types";
import { getBoardDashboardMetrics } from "@/utils/planning.utils";
import { MOCK_BOARDS } from "@/mocks/data/boards.mock";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

// In-memory working copy to simulate state persistence across client interactions
let inMemoryBoards: Board[] = [...MOCK_BOARDS];
const inMemoryBoardDetails: Record<string, BoardDetail> = {
  [MOCK_BOARD_DETAIL.id]: JSON.parse(JSON.stringify(MOCK_BOARD_DETAIL)),
};

export const boardApi = {
  /**
   * Retrieves all boards in a given workspace
   * (Mock implementation ready for GET /api/v1/workspaces/:workspaceId/boards)
   */
  async getBoards(workspaceId: string = "ws-core-platform"): Promise<Board[]> {
    return inMemoryBoards.filter((b) => b.workspaceId === workspaceId);
  },

  /**
   * Retrieves full details and Kanban lists for a single board
   * (Mock implementation ready for GET /api/v1/boards/:id)
   */
  async getBoardDetail(boardId: string): Promise<BoardDetail> {
    if (inMemoryBoardDetails[boardId]) {
      return JSON.parse(JSON.stringify(inMemoryBoardDetails[boardId]));
    }

    const fallbackBoard = inMemoryBoards.find((b) => b.id === boardId);
    if (fallbackBoard) {
      const newDetail: BoardDetail = {
        id: fallbackBoard.id,
        workspaceId: fallbackBoard.workspaceId,
        name: fallbackBoard.name || fallbackBoard.title,
        description: fallbackBoard.description,
        status: fallbackBoard.status === "active" ? "ACTIVE" : "ARCHIVED",
        members: [...fallbackBoard.members],
        labels: [],
        lists: [
          {
            id: `col-todo-${boardId}`,
            boardId,
            name: "TO DO",
            category: "TODO",
            position: 1024,
            status: "ACTIVE",
            cards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `col-inprogress-${boardId}`,
            boardId,
            name: "IN PROGRESS",
            category: "IN_PROGRESS",
            position: 2048,
            status: "ACTIVE",
            cards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `col-done-${boardId}`,
            boardId,
            name: "DONE",
            category: "DONE",
            position: 3072,
            status: "ACTIVE",
            cards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        updatedAt: fallbackBoard.updatedAt,
        createdAt: fallbackBoard.createdAt,
      };
      inMemoryBoardDetails[boardId] = newDetail;
      return JSON.parse(JSON.stringify(newDetail));
    }

    throw new Error(`Board not found: ${boardId}`);
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

  /**
   * Retrieves aggregated statistical metrics of a project board
   * (Mirrors GET /api/v1/boards/{id}/dashboard -> BoardDashboardResponse)
   */
  async getBoardDashboard(boardId: string): Promise<BoardDashboard> {
    let detail = inMemoryBoardDetails[boardId];
    if (!detail) {
      try {
        detail = await this.getBoardDetail(boardId);
      } catch {
        // board not found
      }
    }

    if (detail && detail.lists) {
      return getBoardDashboardMetrics(detail.lists);
    }

    return {
      totalCards: 0,
      completedCards: 0,
      inProgressCards: 0,
      todoCards: 0,
      overdueCards: 0,
      completionRate: 0,
    };
  },
};
