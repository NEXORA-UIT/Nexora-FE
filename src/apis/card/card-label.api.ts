import type {
  BoardLabel,
  BoardLabelDto,
  CardLabelDto,
  LinkCardLabelRequest,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "../client";
import {
  mapBoardLabelDtoToBoardLabel,
  mapBoardLabelDtosToBoardLabels,
  mapCardLabelDtoToBoardLabel,
  mapCardLabelDtosToBoardLabels,
} from "@/mappers/card.mapper";

export const cardLabelApi = {
  /**
   * Creates a new label in a board
   * POST /api/v1/boards/:boardId/labels
   */
  async createBoardLabel(
    boardId: string,
    payload: { name: string; color: string }
  ): Promise<BoardLabel> {
    const response = await apiClient.post<ApiSuccessResponse<BoardLabelDto>>(
      `/boards/${boardId}/labels`,
      payload
    );
    return mapBoardLabelDtoToBoardLabel(response.data.data);
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
};
