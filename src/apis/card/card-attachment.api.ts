import type { AttachmentDto, ApiSuccessResponse } from "@/types";
import { apiClient } from "../client";

function encodeUtf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary);
}

export const cardAttachmentApi = {
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
  async uploadCardAttachment(
    cardId: string,
    file: File
  ): Promise<AttachmentDto> {
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
    const response = await apiClient.get<Blob>(
      `/attachments/${attachmentId}/content`,
      {
        responseType: "blob",
      }
    );
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
};
