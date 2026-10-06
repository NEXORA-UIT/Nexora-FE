import type {
  KanbanCard,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
  ChecklistItem,
  CardComment,
  CardActivity,
} from "@/types";
import {
  MOCK_BOARD_DETAIL,
  MOCK_BOARD_MEMBERS,
  MOCK_BOARD_LABELS,
} from "@/mocks/data/kanban.mock";

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
      checklist: [],
      dependencies: [],
      attachments: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    targetList.cards = [...targetList.cards, newCard];
    return newCard;
  },

  /**
   * Updates card properties with Optimistic Concurrency Control (OCC)
   * (Mirrors PATCH /api/v1/cards/{id} -> CardResponse)
   */
  async updateCard(cardId: string, payload: UpdateCardInput): Promise<KanbanCard> {
    for (const list of inMemoryLists) {
      const idx = list.cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        const card = list.cards[idx];

        // Enforce OCC check
        if (card.updatedAt !== payload.updatedAt) {
          throw new Error("CARD_CONFLICT: Card was modified by another session.");
        }

        const updatedCard: KanbanCard = {
          ...card,
          title: payload.title !== undefined ? payload.title.trim() : card.title,
          description: payload.description !== undefined ? payload.description : card.description,
          startDate: payload.startDate !== undefined ? payload.startDate : card.startDate,
          dueDate: payload.dueDate !== undefined ? payload.dueDate : card.dueDate,
          priority: payload.priority !== undefined ? payload.priority : card.priority,
          assignees:
            payload.assigneeIds !== undefined
              ? MOCK_BOARD_MEMBERS.filter((m) => payload.assigneeIds?.includes(m.id))
              : card.assignees,
          labels:
            payload.labelIds !== undefined
              ? MOCK_BOARD_LABELS.filter((l) => payload.labelIds?.includes(l.id))
              : card.labels,
          updatedAt: new Date().toISOString(),
        };

        list.cards[idx] = updatedCard;
        return { ...updatedCard };
      }
    }
    throw new Error(`Card not found: ${cardId}`);
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

  /**
   * Adds a checklist task to a card
   * (Mirrors POST /api/v1/cards/{id}/tasks -> TaskResponse)
   */
  async addChecklistItem(cardId: string, title: string): Promise<ChecklistItem> {
    for (const list of inMemoryLists) {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) {
        const checklist = card.checklist ? [...card.checklist] : [];
        const maxPos = checklist.reduce((max, t) => Math.max(max, t.position), 0);
        const newItem: ChecklistItem = {
          id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          cardId,
          title: title.trim(),
          isCompleted: false,
          position: maxPos + 1024,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        card.checklist = [...checklist, newItem];
        card.tasksCount = card.checklist.length;
        card.completedTasksCount = card.checklist.filter((t) => t.isCompleted).length;
        card.updatedAt = new Date().toISOString();

        return newItem;
      }
    }
    throw new Error(`Card not found: ${cardId}`);
  },

  /**
   * Updates an existing checklist task (title or completion status)
   * (Mirrors PATCH /api/v1/tasks/{id} -> TaskResponse)
   */
  async updateChecklistItem(
    taskId: string,
    updates: { title?: string; isCompleted?: boolean }
  ): Promise<ChecklistItem> {
    for (const list of inMemoryLists) {
      for (const card of list.cards) {
        if (!card.checklist) continue;
        const taskIdx = card.checklist.findIndex((t) => t.id === taskId);
        if (taskIdx !== -1) {
          const prev = card.checklist[taskIdx];
          const updated: ChecklistItem = {
            ...prev,
            title: updates.title !== undefined ? updates.title.trim() : prev.title,
            isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : prev.isCompleted,
            updatedAt: new Date().toISOString(),
          };

          card.checklist[taskIdx] = updated;
          card.completedTasksCount = card.checklist.filter((t) => t.isCompleted).length;
          card.updatedAt = new Date().toISOString();

          return updated;
        }
      }
    }
    throw new Error(`Checklist item not found: ${taskId}`);
  },

  /**
   * Deletes a checklist task
   * (Mirrors DELETE /api/v1/tasks/{id} -> EmptySuccessResponse)
   */
  async deleteChecklistItem(taskId: string): Promise<void> {
    for (const list of inMemoryLists) {
      for (const card of list.cards) {
        if (!card.checklist) continue;
        const taskIdx = card.checklist.findIndex((t) => t.id === taskId);
        if (taskIdx !== -1) {
          card.checklist = card.checklist.filter((t) => t.id !== taskId);
          card.tasksCount = card.checklist.length;
          card.completedTasksCount = card.checklist.filter((t) => t.isCompleted).length;
          card.updatedAt = new Date().toISOString();
          return;
        }
      }
    }
    throw new Error(`Checklist item not found: ${taskId}`);
  },

  /**
   * Adds a new comment to a card
   * (Mirrors POST /api/v1/cards/{id}/comments -> CommentResponse)
   */
  async addComment(cardId: string, content: string): Promise<CardComment> {
    for (const list of inMemoryLists) {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) {
        const comments = card.comments ? [...card.comments] : [];
        const newComment: CardComment = {
          id: `comment-${Date.now()}`,
          cardId,
          author: MOCK_BOARD_MEMBERS[0], // Current active user (PM Phan Gia Đạt)
          content: content.trim(),
          createdAt: new Date().toISOString(),
        };

        card.comments = [...comments, newComment];
        card.updatedAt = new Date().toISOString();
        return newComment;
      }
    }
    throw new Error(`Card not found: ${cardId}`);
  },

  /**
   * Lazy-loads card activity logs
   * (Mirrors GET /api/v1/cards/{id}/activities -> PaginatedCardActivityResponse)
   */
  async getActivities(cardId: string): Promise<CardActivity[]> {
    const card = await this.getCardById(cardId);
    return [
      {
        id: `act-${cardId}-1`,
        cardId,
        user: card.assignees[0] || MOCK_BOARD_MEMBERS[0],
        action: "created this card",
        createdAt: card.createdAt,
      },
      {
        id: `act-${cardId}-2`,
        cardId,
        user: MOCK_BOARD_MEMBERS[4],
        action: "updated description and checklist",
        createdAt: card.updatedAt,
      },
    ];
  },

  /**
   * Soft deletes a card
   * (Mirrors DELETE /api/v1/cards/{id} -> EmptySuccessResponse)
   */
  async deleteCard(cardId: string): Promise<void> {
    for (const list of inMemoryLists) {
      const idx = list.cards.findIndex((c) => c.id === cardId);
      if (idx !== -1) {
        list.cards = list.cards.filter((c) => c.id !== cardId);
        return;
      }
    }
    throw new Error(`Card not found: ${cardId}`);
  },
};
