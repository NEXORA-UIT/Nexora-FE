import { apiClient } from "@/apis/client";
import type { BoardCalendarEntryDto, BoardCalendarResponse } from "@/types";

export const planningApi = {
  async getBoardCalendar(
    boardId: string,
    range?: { from?: string; to?: string }
  ): Promise<BoardCalendarEntryDto[]> {
    const response = await apiClient.get<BoardCalendarResponse>(`/boards/${boardId}/calendar`, {
      params: range,
    });
    return response.data.data ?? [];
  },
};
