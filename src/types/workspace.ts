import type { WorkspacePaginationMeta } from "./dto/workspace.dto";

export type WorkspaceStatus = "active" | "archived" | "paused";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  description: string;
  memberCount?: number;
  activeBoardCount?: number;
  teamType: string;
  initials: string;
  isFrozen?: boolean;
}

/**
 * Normalized response for workspace listing.
 * Contains domain Workspace models transformed from backend WorkspaceDtos,
 * alongside standard pagination metadata.
 */
export interface ListWorkspacesResponse {
  items: Workspace[];
  meta?: WorkspacePaginationMeta;
}

export interface WorkspaceHeaderProps {
  workspace: Workspace;
  onCreateBoardClick: () => void;
  onMoreActionsClick?: () => void;
  onArchiveClick?: () => void;
  onRestoreClick?: () => void;
}

export type WorkspaceTabId = "overview" | "boards" | "members" | "settings";

export interface WorkspaceTabsProps {
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  boardCount?: number;
  memberCount?: number;
}
