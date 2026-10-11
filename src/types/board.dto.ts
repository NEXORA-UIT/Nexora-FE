export type BackendBoardStatus = "ACTIVE" | "ARCHIVED";

export interface BoardDto {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  coverColor: string | null;
  coverUrl: string | null;
  status: BackendBoardStatus;
  pmId: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMemberDto {
  id: string;
  boardId: string;
  userId: string;
  role: "PM" | "MEMBER";
  appointedBy?: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

export interface ListBoardsQuery {
  includeArchived?: boolean;
}

export interface CreateBoardRequest {
  name: string;
  description?: string | null;
  coverColor?: string | null;
  coverUrl?: string | null;
  pmId?: string;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string | null;
  coverColor?: string | null;
  coverUrl?: string | null;
}

export interface ConfirmDeleteBoardRequest {
  confirmationName: string;
}

export interface AssignBoardPmRequest {
  pmId: string;
}
