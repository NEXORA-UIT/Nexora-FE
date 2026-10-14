import type {
  CardAssignmentDto,
  AssignCardMemberRequest,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "../client";

export const cardAssignmentApi = {
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
  async assignCardMember(
    cardId: string,
    userId: string
  ): Promise<CardAssignmentDto> {
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
};
