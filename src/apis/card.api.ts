import type { KanbanCard, CreateCardInput, MoveCardInput } from "@/types";
import { MOCK_BOARD_DETAIL, MOCK_BOARD_MEMBERS } from "@/mocks/data/kanban.mock";

// In-memory working store for cards, indexed by listId
const inMemoryLists = [...MOCK_BOARD_DETAIL.lists];

export const cardApi = {
  /**
   * Creates a new work card in a specified list
   * (Mirrors POST /api/v1/lists/{id}/cards -> CardResponse)
   */
  async createCard(listId: string, payload: CreateCardInput): Promise<KanbanCard> {
    const targetList = inMemoryLists.find((l) => l.id === listId);
    if (!targetList) {
      throw new Error(`List not found: ${listId}`);
    }

    const maxPosition = targetList.cards.reduce((max, c) => Math.max(max, c.position), 0);
    const newPosition = maxPosition + 1024;
    const cardNum = Math.floor(100 + Math.random() * 900);

    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      listId,
      boardId: targetList.boardId,
      code: `NEX-${cardNum}`,
      title: payload.title.trim(),
      description: payload.description || "",
      priority: payload.priority || "MEDIUM",
      position: newPosition,
      status: "ACTIVE",
      dueDate: payload.dueDate || null,
      assignees: [MOCK_BOARD_MEMBERS[0]], // Default to current user
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    targetList.cards = [...targetList.cards, newCard];
    return newCard;
  },

  /**
   * Moves a card position or transfers to another list
   * (Mirrors PATCH /api/v1/cards/{id}/move -> EmptySuccessResponse)
   */
  async moveCard(cardId: string, payload: MoveCardInput): Promise<void> {
    let foundCard: KanbanCard | null = null;

    // Find and remove card from current list
    for (const list of inMemoryLists) {
      const idx = list.cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        foundCard = { ...list.cards[idx] };
        list.cards = list.cards.filter((c) => c.id !== cardId);
        break;
      }
    }

    if (!foundCard) {
      throw new Error(`Card not found: ${cardId}`);
    }

    // Insert into target list
    const targetList = inMemoryLists.find((l) => l.id === payload.targetListId);
    if (!targetList) {
      throw new Error(`Target list not found: ${payload.targetListId}`);
    }

    foundCard.listId = payload.targetListId;
    foundCard.position = payload.position;
    foundCard.updatedAt = new Date().toISOString(); // Updated OCC timestamp

    targetList.cards = [...targetList.cards, foundCard].sort((a, b) => a.position - b.position);
  },

  /**
   * Retrieves single card detail
   * (Mirrors GET /api/v1/cards/{id} -> CardDetailResponse)
   */
  async getCardById(cardId: string): Promise<KanbanCard> {
    for (const list of inMemoryLists) {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) return { ...card };
    }
    throw new Error(`Card not found: ${cardId}`);
  },
};
