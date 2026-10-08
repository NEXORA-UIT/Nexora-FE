export type BoardStatus = "active" | "archived";

export interface BoardMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  role?: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  name?: string;
  title: string;
  description: string;
  status: BoardStatus;
  openTasksCount: number;
  completedPercent: number;
  members: BoardMember[];
  maxVisibleAvatars?: number;
  coverColor?: string | null;
  coverUrl?: string | null;
  updatedAt: string;
  createdAt: string;
}

export type BoardFilterTab = "all" | "active" | "archived";

export type BoardSortOption =
  | "recently_updated"
  | "name_asc"
  | "progress_desc"
  | "tasks_desc";

export interface CreateBoardInput {
  name?: string;
  title: string;
  description?: string;
  workspaceId: string;
  coverColor?: string;
}

export interface BoardToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: BoardFilterTab;
  onFilterChange: (filter: BoardFilterTab) => void;
  sortBy: BoardSortOption;
  onSortChange: (sort: BoardSortOption) => void;
  counts: {
    all: number;
    active: number;
    archived: number;
  };
}

export interface BoardCardProps {
  board: Board;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (board: Board) => void;
}

export interface ArchivedBoardCardProps {
  board: Board;
  onRestore: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (board: Board) => void;
}

export interface BoardActionMenuProps {
  board: Board;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateBoardInput) => Promise<void> | void;
  workspaceId: string;
  isSubmitting?: boolean;
}

export interface ConfirmDeleteBoardDialogProps {
  board: Board | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (boardId: string, confirmationName: string) => Promise<void> | void;
  isDeleting?: boolean;
}

