import type {
  KanbanCard,
  BoardMember,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
  CardDto,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  ListCardsQuery,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "../client";
import {
  mapCardDtoToKanbanCard,
  mapCardDtosToKanbanCards,
} from "@/mappers/card.mapper";

export const cardCoreApi = {
  /**
   * Retrieves all cards for a given board
   * GET /api/v1/boards/:boardId/cards
   */
  async getBoardCards(
    boardId: string,
    options?: ListCardsQuery,
    membersPool?: BoardMember[],
  ): Promise<KanbanCard[]> {
    const params: Record<string, string | string[]> = {};
    if (options?.includeArchived !== undefined) {
      params.includeArchived = options.includeArchived ? "true" : "false";
    }
    if (options?.q) params.q = options.q;
    if (options?.statusGroup) params.statusGroup = options.statusGroup;
    if (options?.isOverdue !== undefined) params.isOverdue = String(options.isOverdue);
    if (options?.assigneeId) params.assigneeId = options.assigneeId;
    if (options?.labelId) params.labelId = options.labelId;

    const response = await apiClient.get<ApiSuccessResponse<CardDto[]>>(
      `/boards/${boardId}/cards`,
      {
        params: Object.keys(params).length > 0 ? params : undefined,
        ...(Array.isArray(params.assigneeId) || Array.isArray(params.labelId)
          ? { paramsSerializer: { indexes: null } }
          : {}),
      }
    );

    return mapCardDtosToKanbanCards(response.data.data || [], undefined, membersPool);
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
   * GET /api/v1/cards/:id
   */
  async getCardById(cardId: string): Promise<KanbanCard> {
    const response = await apiClient.get<ApiSuccessResponse<CardDto>>(
      `/cards/${cardId}`
    );
    return mapCardDtoToKanbanCard(response.data.data);
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
};
