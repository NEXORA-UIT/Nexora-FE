import { apiClient, ApiError } from "./client";
import type {
  ApiSuccessResponse,
  GitActivityFeed,
  GitActivityItem,
  GitHubConfig,
  GitHubConfigRequest,
} from "@/types";
import { mockGitActivity } from "@/mocks/data/github.mock";

export const GITHUB_WEBHOOK_URL = "http://localhost:3000/api/v1/github/webhooks";

export const githubApi = {
  async getGitHubConfig(boardId: string): Promise<GitHubConfig> {
    const response = await apiClient.get<ApiSuccessResponse<GitHubConfig>>(
      `/boards/${boardId}/github/config`
    );
    return response.data.data;
  },

  async configureGitHub(boardId: string, request: GitHubConfigRequest): Promise<GitHubConfig> {
    const response = await apiClient.post<ApiSuccessResponse<GitHubConfig>>(
      `/boards/${boardId}/github/config`,
      request
    );
    return response.data.data;
  },

  async disconnectGitHub(boardId: string): Promise<void> {
    await apiClient.delete(`/boards/${boardId}/github/config`);
  },

  async getCardGitActivity(cardId: string, cardCode: string): Promise<GitActivityFeed> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<GitActivityItem[]>>(
        `/cards/${cardId}/git-activity`
      );
      return { items: response.data.data, source: "API" };
    } catch (cause) {
      if (cause instanceof ApiError && cause.status !== 404 && cause.status < 500) throw cause;
      const items = mockGitActivity
        .filter((item) => item.cardCode === cardCode)
        .map(({ cardCode: _cardCode, ...item }) => ({ ...item, cardId }));
      return { items, source: "DEMO" };
    }
  },
};
