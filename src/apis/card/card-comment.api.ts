import type {
  CommentDto,
  CreateCommentRequest,
  UpdateCommentRequest,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "../client";

export const cardCommentApi = {
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
  async createCardComment(
    cardId: string,
    content: string
  ): Promise<CommentDto> {
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
  async updateCardComment(
    commentId: string,
    content: string
  ): Promise<CommentDto> {
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
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/comments/${commentId}`
    );
  },
};
