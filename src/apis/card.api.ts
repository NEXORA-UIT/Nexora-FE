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
  CardDependenciesResponseDto,
  CardDependencyRecordDto,
  ActivityLogDto,
  PaginatedActivitiesResult,
  GetCardActivityQuery,
  CardDto,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  ListCardsQuery,
  ApiSuccessResponse,
  TaskDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  CardAssignmentDto,
  AssignCardMemberRequest,
  BoardMember,
  BoardLabel,
  BoardLabelDto,
  CardLabelDto,
  LinkCardLabelRequest,
  CommentDto,
  CreateCommentRequest,
  UpdateCommentRequest,
  AttachmentDto,
} from "@/types";

import { apiClient } from "./client";
import {
  mapCardDtoToKanbanCard,
  mapCardDtosToKanbanCards,
  mapTaskDtoToChecklistItem,
  mapTaskDtosToChecklistItems,
  mapBoardLabelDtosToBoardLabels,
  mapCardLabelDtoToBoardLabel,
  mapCardLabelDtosToBoardLabels,
  mapCommentDtoToCardComment,
  mapCardPrerequisiteDtosToCardDependencies,
  mapActivityLogDtosToCardActivities,
} from "@/mappers/card.mapper";
import { MOCK_BOARD_MEMBERS } from "@/mocks/data/kanban.mock";

function encodeUtf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

export const cardApi = {
  /**
   * Retrieves all cards for a given board
   * GET /api/v1/boards/:boardId/cards
   */
  async getBoardCards(
    boardId: string,
    options?: ListCardsQuery,
    membersPool?: BoardMember[]
  ): Promise<KanbanCard[]> {
    const params: Record<string, string | string[]> = {};
    if (options?.includeArchived !== undefined) {
      params.includeArchived = options.includeArchived ? "true" : "false";
    }
    if (options?.q) params.q = options.q;
    if (options?.assigneeId) params.assigneeId = options.assigneeId;
    if (options?.labelId) params.labelId = options.labelId;
    if (options?.statusGroup) params.statusGroup = options.statusGroup;
    if (options?.isOverdue !== undefined) params.isOverdue = String(options.isOverdue);

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

    const response = await apiClient.patch<ApiSuccessResponse<CardDto>>(`/cards/${cardId}`, body);

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
    const response = await apiClient.get<ApiSuccessResponse<CardDto>>(`/cards/${cardId}`);
    return mapCardDtoToKanbanCard(response.data.data);
  },

  /**
   * Retrieves all checklist tasks for a card
   * GET /api/v1/cards/:cardId/tasks
   */
  async getCardTasks(cardId: string): Promise<ChecklistItem[]> {
    const response = await apiClient.get<ApiSuccessResponse<TaskDto[]>>(`/cards/${cardId}/tasks`);
    return mapTaskDtosToChecklistItems(response.data.data || []);
  },

  /**
   * Adds a checklist task to a card
   * POST /api/v1/cards/:cardId/tasks
   */
  async addChecklistItem(cardId: string, title: string): Promise<ChecklistItem> {
    const body: CreateTaskRequest = {
      title: title.trim(),
    };
    const response = await apiClient.post<ApiSuccessResponse<TaskDto>>(
      `/cards/${cardId}/tasks`,
      body
    );
    return mapTaskDtoToChecklistItem(response.data.data);
  },

  /**
   * Updates an existing checklist task (title or completion status)
   * PATCH /api/v1/tasks/:taskId
   */
  async updateChecklistItem(taskId: string, updates: UpdateTaskRequest): Promise<ChecklistItem> {
    const body: UpdateTaskRequest = {};
    if (updates.title !== undefined) {
      body.title = updates.title.trim();
    }
    if (updates.isCompleted !== undefined) {
      body.isCompleted = updates.isCompleted;
    }

    const response = await apiClient.patch<ApiSuccessResponse<TaskDto>>(`/tasks/${taskId}`, body);
    return mapTaskDtoToChecklistItem(response.data.data);
  },

  /**
   * Deletes a checklist task
   * DELETE /api/v1/tasks/:taskId
   */
  async deleteChecklistItem(taskId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(`/tasks/${taskId}`);
  },

  /**
   * Retrieves all assignments for a card
   * GET /api/v1/cards/:cardId/assignments
   */
  async getCardAssignments(cardId: string): Promise<CardAssignmentDto[]> {
    const response = await apiClient.get<ApiSuccessResponse<CardAssignmentDto[]>>(
      `/cards/${cardId}/assignments`
    );
    return response.data.data || [];
  },

  /**
   * Assigns a user to a card
   * POST /api/v1/cards/:cardId/assignments
   */
  async assignCardMember(cardId: string, userId: string): Promise<CardAssignmentDto> {
    const body: AssignCardMemberRequest = { userId };
    const response = await apiClient.post<ApiSuccessResponse<CardAssignmentDto>>(
      `/cards/${cardId}/assignments`,
      body
    );
    return response.data.data;
  },

  /**
   * Unassigns a user from a card
   * DELETE /api/v1/cards/:cardId/assignments/:userId
   */
  async unassignCardMember(cardId: string, userId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/cards/${cardId}/assignments/${userId}`
    );
  },

  /**
   * Retrieves all labels defined for a board
   * GET /api/v1/boards/:boardId/labels
   */
  async getBoardLabels(boardId: string): Promise<BoardLabel[]> {
    const response = await apiClient.get<ApiSuccessResponse<BoardLabelDto[]>>(
      `/boards/${boardId}/labels`
    );
    return mapBoardLabelDtosToBoardLabels(response.data.data || []);
  },

  /**
   * Retrieves all labels attached to a card
   * GET /api/v1/cards/:cardId/labels
   */
  async getCardLabels(cardId: string): Promise<BoardLabel[]> {
    const response = await apiClient.get<ApiSuccessResponse<CardLabelDto[]>>(
      `/cards/${cardId}/labels`
    );
    return mapCardLabelDtosToBoardLabels(response.data.data || []);
  },

  /**
   * Attaches an existing board label to a card
   * POST /api/v1/cards/:cardId/labels
   */
  async attachCardLabel(cardId: string, labelId: string): Promise<BoardLabel> {
    const body: LinkCardLabelRequest = { labelId };
    const response = await apiClient.post<ApiSuccessResponse<CardLabelDto>>(
      `/cards/${cardId}/labels`,
      body
    );
    return mapCardLabelDtoToBoardLabel(response.data.data);
  },

  /**
   * Detaches a label from a card
   * DELETE /api/v1/cards/:cardId/labels/:labelId
   */
  async detachCardLabel(cardId: string, labelId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/cards/${cardId}/labels/${labelId}`
    );
  },

  /**
   * Retrieves all comments for a card
   * GET /api/v1/cards/:cardId/comments
   */
  async getCardComments(cardId: string): Promise<CommentDto[]> {
    const response = await apiClient.get<ApiSuccessResponse<CommentDto[]>>(
      `/cards/${cardId}/comments`
    );
    return response.data.data || [];
  },

  /**
   * Adds a new comment to a card
   * POST /api/v1/cards/:cardId/comments
   */
  async createCardComment(cardId: string, content: string): Promise<CommentDto> {
    const body: CreateCommentRequest = {
      content: content.trim(),
    };
    const response = await apiClient.post<ApiSuccessResponse<CommentDto>>(
      `/cards/${cardId}/comments`,
      body
    );
    return response.data.data;
  },

  /**
   * Updates an existing comment on a card
   * PATCH /api/v1/comments/:commentId
   */
  async updateCardComment(commentId: string, content: string): Promise<CommentDto> {
    const body: UpdateCommentRequest = {
      content: content.trim(),
    };
    const response = await apiClient.patch<ApiSuccessResponse<CommentDto>>(
      `/comments/${commentId}`,
      body
    );
    return response.data.data;
  },

  /**
   * Soft deletes a comment
   * DELETE /api/v1/comments/:commentId
   */
  async deleteCardComment(commentId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(`/comments/${commentId}`);
  },

  /**
   * Retrieves all attachments for a card
   * GET /api/v1/cards/:cardId/attachments
   */
  async getCardAttachments(cardId: string): Promise<AttachmentDto[]> {
    const response = await apiClient.get<ApiSuccessResponse<AttachmentDto[]>>(
      `/cards/${cardId}/attachments`
    );
    return response.data.data || [];
  },

  /**
   * Uploads a raw binary attachment file to a card
   * POST /api/v1/cards/:cardId/attachments
   */
  async uploadCardAttachment(cardId: string, file: File): Promise<AttachmentDto> {
    const response = await apiClient.post<ApiSuccessResponse<AttachmentDto>>(
      `/cards/${cardId}/attachments`,
      file,
      {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "x-file-name-b64": encodeUtf8Base64(file.name),
        },
        timeout: 60000,
      }
    );
    return response.data.data;
  },

  /**
   * Downloads raw binary content of an attachment
   * GET /api/v1/attachments/:attachmentId/content
   */
  async downloadCardAttachment(attachmentId: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/attachments/${attachmentId}/content`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Permanently deletes an attachment
   * DELETE /api/v1/attachments/:attachmentId
   */
  async deleteCardAttachment(attachmentId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/attachments/${attachmentId}`
    );
  },

  /**
   * Adds a new comment to a card (legacy method maintained for backwards compatibility)
   */
  async addComment(cardId: string, content: string): Promise<CardComment> {
    const dto = await this.createCardComment(cardId, content);
    return mapCommentDtoToCardComment(dto, MOCK_BOARD_MEMBERS);
  },

  /**
   * Retrieves paginated activity logs for a card
   * GET /api/v1/cards/:cardId/activity
   */
  async getCardActivities(
    cardId: string,
    params?: GetCardActivityQuery,
    membersPool?: BoardMember[]
  ): Promise<PaginatedActivitiesResult> {
    const queryParams: Record<string, string | number> = {};
    if (params?.limit !== undefined) queryParams.limit = params.limit;
    if (params?.cursor) queryParams.cursor = params.cursor;

    const response = await apiClient.get<
      ApiSuccessResponse<ActivityLogDto[]> & { nextCursor?: string | null }
    >(`/cards/${cardId}/activity`, {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });

    const items = mapActivityLogDtosToCardActivities(response.data.data || [], membersPool);
    const nextCursor = response.data.nextCursor ?? null;

    return { items, nextCursor };
  },

  /**
   * Retrieves card activity logs
   * GET /api/v1/cards/:cardId/activity
   */
  async getActivities(cardId: string, membersPool?: BoardMember[]): Promise<CardActivity[]> {
    const result = await this.getCardActivities(cardId, { limit: 20 }, membersPool);
    return result.items;
  },

  /**
   * Archives a card
   * PATCH /api/v1/cards/:id/archive
   */
  async archiveCard(cardId: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(`/cards/${cardId}/archive`);
  },

  /**
   * Restores an archived card
   * PATCH /api/v1/cards/:id/restore
   */
  async restoreCard(cardId: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(`/cards/${cardId}/restore`);
  },

  /**
   * Soft deletes a card
   * DELETE /api/v1/cards/:id
   */
  async deleteCard(cardId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(`/cards/${cardId}`);
  },

  /**
   * Retrieves all dependency prerequisites for a card
   * GET /api/v1/cards/:cardId/dependencies
   */
  async getCardDependencies(cardId: string): Promise<CardDependency[]> {
    const response = await apiClient.get<ApiSuccessResponse<CardDependenciesResponseDto>>(
      `/cards/${cardId}/dependencies`
    );
    return mapCardPrerequisiteDtosToCardDependencies(
      response.data.data?.prerequisites || [],
      cardId
    );
  },

  /**
   * Declares a dependency prerequisite for a card
   * POST /api/v1/cards/:cardId/dependencies
   */
  async addDependency(cardId: string, payload: CreateDependencyRequest): Promise<CardDependency> {
    if (cardId === payload.dependsOnCardId) {
      throw new Error("Cannot depend on self");
    }

    const response = await apiClient.post<ApiSuccessResponse<CardDependencyRecordDto>>(
      `/cards/${cardId}/dependencies`,
      payload
    );

    // Refresh dependencies to get complete prerequisite card metadata
    const freshDependencies = await this.getCardDependencies(cardId);
    const matched = freshDependencies.find(
      (d) => d.id === response.data.data?.id || d.prerequisiteCardId === payload.dependsOnCardId
    );

    if (matched) return matched;

    return {
      id: response.data.data?.id || `dep-${Date.now()}`,
      cardId,
      prerequisiteCardId: payload.dependsOnCardId,
      prerequisiteCode: "",
      prerequisiteTitle: "",
      prerequisiteStatus: "TODO",
      isCompleted: false,
    };
  },

  /**
   * Removes a dependency prerequisite from a card
   * DELETE /api/v1/cards/:cardId/dependencies/:dependencyId
   */
  async deleteDependency(cardId: string, dependencyId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/cards/${cardId}/dependencies/${dependencyId}`
    );
  },
};
