export interface GitHubConfig {
  boardId: string;
  repositoryName: string;
  webhookUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubConfigRequest {
  repositoryName: string;
  webhookSecret: string;
}

export type GitActivityType = "COMMIT" | "PULL_REQUEST";

export interface GitActivityItem {
  id: string;
  cardId: string;
  type: GitActivityType;
  identifier: string;
  message: string;
  author: string;
  authorAvatarUrl?: string | null;
  url: string;
  timestamp: string;
}

export interface GitActivityFeed {
  items: GitActivityItem[];
  source: "API" | "DEMO";
}

export interface MockGitActivityItem extends GitActivityItem {
  cardCode: string;
}
