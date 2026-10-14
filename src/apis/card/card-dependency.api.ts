import type {
  CardDependency,
  CreateDependencyRequest,
  CardDependenciesResponseDto,
  CardDependencyRecordDto,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "../client";
import { mapCardPrerequisiteDtosToCardDependencies } from "@/mappers/card.mapper";

export const cardDependencyApi = {
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
  async addDependency(
    this: { getCardDependencies: (cardId: string) => Promise<CardDependency[]> } | void,
    cardId: string,
    payload: CreateDependencyRequest
  ): Promise<CardDependency> {
    if (cardId === payload.dependsOnCardId) {
      throw new Error("Cannot depend on self");
    }

    const response = await apiClient.post<ApiSuccessResponse<CardDependencyRecordDto>>(
      `/cards/${cardId}/dependencies`,
      payload
    );

    // Refresh dependencies to get complete prerequisite card metadata
    const fetchDependencies =
      this && typeof this.getCardDependencies === "function"
        ? this.getCardDependencies.bind(this)
        : cardDependencyApi.getCardDependencies;

    const freshDependencies = await fetchDependencies(cardId);
    const matched = freshDependencies.find(
      (d) =>
        d.id === response.data.data?.id ||
        d.prerequisiteCardId === payload.dependsOnCardId
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
