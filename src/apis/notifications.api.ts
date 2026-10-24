import { apiClient } from '@/apis/client';

export type NotificationDto = {
  id: string;
  userId: string;
  actorId: string | null;
  boardId: string | null;
  cardId: string | null;
  type: 'CARD_ASSIGNED' | 'COMMENT_MENTION' | 'CARD_DUE_SOON';
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationPage = {
  data: NotificationDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type SuccessResponse<T> = { success: boolean; data: T };

export const notificationsApi = {
  async list(page = 1, limit = 20): Promise<NotificationPage> {
    const response = await apiClient.get<SuccessResponse<NotificationDto[]> & Omit<NotificationPage, 'data'>>(
      '/notifications',
      { params: { page, limit } },
    );
    return {
      data: response.data.data,
      page: response.data.page,
      limit: response.data.limit,
      total: response.data.total,
      totalPages: response.data.totalPages,
    };
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<SuccessResponse<{ count: number }>>(
      '/notifications/unread-count',
    );
    return response.data.data.count;
  },

  async markRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await apiClient.patch('/notifications/read-all');
  },

  async remove(id: string) {
    await apiClient.delete(`/notifications/${id}`);
  },
};
