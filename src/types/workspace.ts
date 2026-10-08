export type WorkspaceStatus = "active" | "archived" | "paused";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  description: string;
  memberCount: number;
  activeBoardCount: number;
  teamType: string;
  initials: string;
}

export interface WorkspaceHeaderProps {
  workspace: Workspace;
  onCreateBoardClick: () => void;
  onMoreActionsClick?: () => void;
}

export type WorkspaceTabId = "overview" | "boards" | "members" | "settings";

export interface WorkspaceTabsProps {
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  boardCount: number;
  memberCount: number;
}
