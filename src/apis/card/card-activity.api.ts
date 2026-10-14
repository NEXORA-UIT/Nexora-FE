import type {
  ActivityLogDto,
  PaginatedActivitiesResult,
  GetCardActivityQuery,
  BoardMember,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "../client";
import { mapActivityLogDtosToCardActivities } from "@/mappers/card.mapper";

export const cardActivityApi = {
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

    const items = mapActivityLogDtosToCardActivities(
      response.data.data || [],
      membersPool
    );
    const nextCursor = response.data.nextCursor ?? null;

    return { items, nextCursor };
  },
};
