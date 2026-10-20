import { apiClient } from "@/apis/client";
import type {
  ApiSuccessResponse,
  ConvertQuickNoteRequest,
  QuickNoteConversionDto,
  QuickNoteDto,
} from "@/types";

export const quickNoteApi = {
  async listQuickNotes(): Promise<QuickNoteDto[]> {
    const response = await apiClient.get<ApiSuccessResponse<QuickNoteDto[]>>("/quick-notes");
    return response.data.data ?? [];
  },

  async createQuickNote(content: string): Promise<QuickNoteDto> {
    const response = await apiClient.post<ApiSuccessResponse<QuickNoteDto>>("/quick-notes", {
      content,
    });
    return response.data.data;
  },

  async updateQuickNote(id: string, content: string): Promise<QuickNoteDto> {
    const response = await apiClient.patch<ApiSuccessResponse<QuickNoteDto>>(`/quick-notes/${id}`, {
      content,
    });
    return response.data.data;
  },

  async deleteQuickNote(id: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(`/quick-notes/${id}`);
  },

  async convertQuickNoteToCard(
    id: string,
    payload: ConvertQuickNoteRequest
  ): Promise<QuickNoteConversionDto> {
    const response = await apiClient.post<ApiSuccessResponse<QuickNoteConversionDto>>(
      `/quick-notes/${id}/convert`,
      payload
    );
    return response.data.data;
  },
};
