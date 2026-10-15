import type {
  ChecklistItem,
  TaskDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "../client";
import {
  mapTaskDtoToChecklistItem,
  mapTaskDtosToChecklistItems,
} from "@/mappers/card.mapper";

export const cardTaskApi = {
  /**
   * Retrieves all checklist tasks for a card
   * GET /api/v1/cards/:cardId/tasks
   */
  async getCardTasks(cardId: string): Promise<ChecklistItem[]> {
    const response = await apiClient.get<ApiSuccessResponse<TaskDto[]>>(
      `/cards/${cardId}/tasks`
    );
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
  async updateChecklistItem(
    taskId: string,
    updates: UpdateTaskRequest
  ): Promise<ChecklistItem> {
    const body: UpdateTaskRequest = {};
    if (updates.title !== undefined) {
      body.title = updates.title.trim();
    }
    if (updates.isCompleted !== undefined) {
      body.isCompleted = updates.isCompleted;
    }

    const response = await apiClient.patch<ApiSuccessResponse<TaskDto>>(
      `/tasks/${taskId}`,
      body
    );
    return mapTaskDtoToChecklistItem(response.data.data);
  },

  /**
   * Deletes a checklist task
   * DELETE /api/v1/tasks/:taskId
   */
  async deleteChecklistItem(taskId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/tasks/${taskId}`
    );
  },
};
