import type { KanbanList, CreateListInput } from "@/types";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

// In-memory working store for board lists
const inMemoryLists: Record<string, KanbanList[]> = {
  [MOCK_BOARD_DETAIL.id]: [...MOCK_BOARD_DETAIL.lists],
};

export const listApi = {
  /**
   * Retrieves all Kanban lists for a given board
   * (Mirrors GET /api/v1/boards/{id}/lists -> ListListResponse)
   */
  async getBoardLists(boardId: string): Promise<KanbanList[]> {
    return inMemoryLists[boardId] ? [...inMemoryLists[boardId]] : [];
  },

  /**
   * Creates a new Kanban list column in a board
   * (Mirrors POST /api/v1/boards/{id}/lists -> ListResponse)
   */
  async createList(boardId: string, payload: CreateListInput): Promise<KanbanList> {
    const currentLists = inMemoryLists[boardId] || [];
    const maxPosition = currentLists.reduce((max, l) => Math.max(max, l.position), 0);
    const newPosition = maxPosition + 1024;

    const newList: KanbanList = {
      id: `col-${Date.now()}`,
      boardId,
      name: payload.name.trim(),
      category: payload.category,
      position: newPosition,
      status: "ACTIVE",
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryLists[boardId] = [...currentLists, newList];
    return newList;
  },

  /**
   * Reorders a list position
   * (Mirrors PATCH /api/v1/lists/{id}/position -> EmptySuccessResponse)
   */
  async reorderList(listId: string, position: number): Promise<void> {
    for (const boardId of Object.keys(inMemoryLists)) {
      const lists = inMemoryLists[boardId];
      const target = lists.find((l) => l.id === listId);
      if (target) {
        target.position = position;
        target.updatedAt = new Date().toISOString();
        lists.sort((a, b) => a.position - b.position);
        break;
      }
    }
  },

  /**
   * Archives a Kanban list
   * (Mirrors POST /api/v1/lists/{id}/archive -> EmptySuccessResponse)
   */
  async archiveList(listId: string): Promise<void> {
    for (const boardId of Object.keys(inMemoryLists)) {
      inMemoryLists[boardId] = inMemoryLists[boardId].filter((l) => l.id !== listId);
    }
  },
};
