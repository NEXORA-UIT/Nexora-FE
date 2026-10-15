export type ListStatusGroupDto = "TODO" | "IN_PROGRESS" | "DONE";

export interface ListDto {
  id: string;
  boardId: string;
  name: string;
  statusGroup: ListStatusGroupDto;
  position: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListListsQuery {
  includeArchived?: boolean;
}

export interface CreateListRequest {
  name: string;
  statusGroup: ListStatusGroupDto;
}

export interface UpdateListRequest {
  name?: string;
  statusGroup?: ListStatusGroupDto;
}

export interface ReorderListRequest {
  position: number;
}

export interface ArchiveListRequest {
  moveCardsToListId?: string;
  archiveCards?: boolean;
}
