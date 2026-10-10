import type {
  KanbanCard,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
  ChecklistItem,
  CardComment,
  CardActivity,
  CardDependency,
  CreateDependencyRequest,
  CardDto,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  ListCardsQuery,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "./client";
import {
  mapCardDtoToKanbanCard,
  mapCardDtosToKanbanCards,
} from "@/mappers/card.mapper";
import { wouldCreateCycle } from "@/utils/planning.utils";
import {
  MOCK_BOARD_DETAIL,
  MOCK_BOARD_MEMBERS,
} from "@/mocks/data/kanban.mock";

// In-memory working store for cards, indexed by listId
const inMemoryLists = [...MOCK_BOARD_DETAIL.lists];

export const cardApi = {
  /**
   * Retrieves all cards for a given board
   * GET /api/v1/boards/:boardId/cards
   */
  async getBoardCards(
    boardId: string,
    options?: ListCardsQuery
  ): Promise<KanbanCard[]> {
    const params: Record<string, string> = {};
    if (options?.includeArchived !== undefined) {
      params.includeArchived = options.includeArchived ? "true" : "false";
    }

    const response = await apiClient.get<ApiSuccessResponse<CardDto[]>>(
      `/boards/${boardId}/cards`,
      {
        params: Object.keys(params).length > 0 ? params : undefined,
      }
    );

    return mapCardDtosToKanbanCards(response.data.data || []);
  },

  /**
   * Creates a new work card in a specified list
   * POST /api/v1/lists/:listId/cards
   */
  async createCard(listId: string, payload: CreateCardInput): Promise<KanbanCard> {
    const body: CreateCardRequest = {
      title: payload.title.trim(),
    };
    if (payload.description !== undefined) {
      body.description = payload.description;
    }
    if (payload.priority !== undefined) {
      body.priority = payload.priority;
    }
    if (payload.startDate !== undefined) {
      body.startDate = payload.startDate ? payload.startDate : null;
    }
    if (payload.dueDate !== undefined) {
      body.dueDate = payload.dueDate ? payload.dueDate : null;
    }

    const response = await apiClient.post<ApiSuccessResponse<CardDto>>(
      `/lists/${listId}/cards`,
      body
    );

    return mapCardDtoToKanbanCard(response.data.data);
  },

  /**
   * Updates card properties with Optimistic Concurrency Control (OCC)
   * PATCH /api/v1/cards/:id
   */
  async updateCard(cardId: string, payload: UpdateCardInput): Promise<KanbanCard> {
    const body: UpdateCardRequest = {
      updatedAt: payload.updatedAt,
    };
    if (payload.title !== undefined) {
      body.title = payload.title.trim();
    }
    if (payload.description !== undefined) {
      body.description = payload.description;
    }
    if (payload.priority !== undefined) {
      body.priority = payload.priority;
    }
    if (payload.startDate !== undefined) {
      body.startDate = payload.startDate ? payload.startDate : null;
    }
    if (payload.dueDate !== undefined) {
      body.dueDate = payload.dueDate ? payload.dueDate : null;
    }

    const response = await apiClient.patch<ApiSuccessResponse<CardDto>>(
      `/cards/${cardId}`,
      body
    );

    return mapCardDtoToKanbanCard(response.data.data);
  },

  /**
   * Moves a card position or transfers to another list with OCC
   * PATCH /api/v1/cards/:id/move
   */
  async moveCard(cardId: string, payload: MoveCardInput): Promise<KanbanCard> {
    const body: MoveCardRequest = {
      targetListId: payload.targetListId,
      position: payload.position,
      updatedAt: payload.updatedAt,
    };

    const response = await apiClient.patch<ApiSuccessResponse<CardDto>>(
      `/cards/${cardId}/move`,
      body
    );

    return mapCardDtoToKanbanCard(response.data.data);
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
    throw new Error("Checklist tasks are not supported for live cards yet.");
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
    throw new Error("Checklist tasks are not supported for live cards yet.");
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
    throw new Error("Checklist tasks are not supported for live cards yet.");
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
    throw new Error("Comments are not supported for live cards yet.");
  },

  /**
   * Lazy-loads card activity logs
   * (Mirrors GET /api/v1/cards/{id}/activities -> PaginatedCardActivityResponse)
   */
  async getActivities(cardId: string): Promise<CardActivity[]> {
    const card = inMemoryLists.flatMap((l) => l.cards).find((c) => c.id === cardId);
    if (!card) {
      throw new Error("Activity logs are not available for live cards yet.");
    }
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
   * Archives a card
   * PATCH /api/v1/cards/:id/archive
   */
  async archiveCard(cardId: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/cards/${cardId}/archive`
    );
  },

  /**
   * Restores an archived card
   * PATCH /api/v1/cards/:id/restore
   */
  async restoreCard(cardId: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/cards/${cardId}/restore`
    );
  },

  /**
   * Soft deletes a card
   * DELETE /api/v1/cards/:id
   */
  async deleteCard(cardId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/cards/${cardId}`
    );
  },

  /**
   * Declares a dependency prerequisite for a card
   * (Mirrors POST /api/v1/cards/{id}/dependencies -> CardDependencyResponse)
   */
  async addDependency(cardId: string, payload: CreateDependencyRequest): Promise<CardDependency> {
    if (cardId === payload.dependsOnCardId) {
      throw new Error("Cannot depend on self");
    }

    let targetCard: KanbanCard | undefined;
    let prereqCard: KanbanCard | undefined;
    let prereqListCategory: "TODO" | "IN_PROGRESS" | "DONE" = "TODO";

    const allCards = inMemoryLists.flatMap((l) => l.cards);

    for (const list of inMemoryLists) {
      for (const card of list.cards) {
        if (card.id === cardId) targetCard = card;
        if (card.id === payload.dependsOnCardId) {
          prereqCard = card;
          prereqListCategory = list.category;
        }
      }
    }

    if (!targetCard || !prereqCard) {
      throw new Error("Dependencies are not supported for live cards yet.");
    }

    if (targetCard.dependencies?.some((d) => d.prerequisiteCardId === payload.dependsOnCardId)) {
      throw new Error("Dependency already exists");
    }

    if (wouldCreateCycle(cardId, payload.dependsOnCardId, allCards)) {
      throw new Error("Circular dependency detected");
    }

    const newDep: CardDependency = {
      id: `dep-${Date.now()}`,
      cardId,
      prerequisiteCardId: payload.dependsOnCardId,
      prerequisiteCode: prereqCard.code,
      prerequisiteTitle: prereqCard.title,
      prerequisiteStatus: prereqListCategory,
      isCompleted: prereqListCategory === "DONE",
    };

    targetCard.dependencies = [...(targetCard.dependencies || []), newDep];
    targetCard.updatedAt = new Date().toISOString();

    return newDep;
  },

  /**
   * Removes a dependency prerequisite from a card
   * (Mirrors DELETE /api/v1/cards/{id}/dependencies/{dependencyId} -> EmptySuccessResponse)
   */
  async deleteDependency(cardId: string, dependencyId: string): Promise<void> {
    for (const list of inMemoryLists) {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) {
        card.dependencies = (card.dependencies || []).filter((d) => d.id !== dependencyId);
        card.updatedAt = new Date().toISOString();
        return;
      }
    }
    throw new Error("Dependencies are not supported for live cards yet.");
  },
};
