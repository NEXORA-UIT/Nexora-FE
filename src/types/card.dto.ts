export type BackendCardPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CardTaskProgressDto {
  total: number;
  completed: number;
  percent: number;
}

export interface CardDto {
  id: string;
  boardId: string;
  listId: string;
  cardKey: string;
  title: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  priority: BackendCardPriority;
  position: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  statusGroup: "TODO" | "IN_PROGRESS" | "DONE";
  taskProgress: CardTaskProgressDto;
}

export interface ListCardsQuery {
  includeArchived?: boolean;
}

export interface CreateCardRequest {
  title: string;
  description?: string | null;
  priority?: BackendCardPriority;
  startDate?: string | null;
  dueDate?: string | null;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string | null;
  priority?: BackendCardPriority;
  startDate?: string | null;
  dueDate?: string | null;
  updatedAt: string;
}

export interface MoveCardRequest {
  targetListId: string;
  position: number;
  updatedAt: string;
}

export interface TaskDto {
  id: string;
  cardId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
}

export interface UpdateTaskRequest {
  title?: string;
  isCompleted?: boolean;
}

export interface CardAssignmentUserDto {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface CardAssignmentDto {
  id: string;
  cardId: string;
  userId: string;
  assignedAt: string;
  user?: CardAssignmentUserDto;
}

export interface AssignCardMemberRequest {
  userId: string;
}

export interface BoardLabelDto {
  id: string;
  boardId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardLabelDto {
  cardId: string;
  labelId: string;
  createdAt: string;
  label: BoardLabelDto;
}

export interface LinkCardLabelRequest {
  labelId: string;
}

export interface CommentDto {
  id: string;
  cardId: string;
  userId: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface AttachmentDto {
  id: string;
  cardId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  createdAt: string;
}

export interface CardPrerequisiteDto {
  id: string; // The prerequisite card ID
  cardKey: string;
  title: string;
  list: {
    id: string;
    name: string;
    statusGroup: "TODO" | "IN_PROGRESS" | "DONE";
  };
  dependencyId: string; // The CardDependency ID
  createdAt: string;
}

export interface CardDependenciesResponseDto {
  prerequisites: CardPrerequisiteDto[];
}

export type { CreateDependencyRequest } from "./planning";

export interface CardDependencyRecordDto {
  id: string;
  cardId: string;
  dependsOnCardId: string;
  createdAt: string;
}

export interface ActivityLogDto {
  id: string;
  boardId: string;
  cardId: string | null;
  actorId: string;
  action: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedActivityResponseDto {
  data: ActivityLogDto[];
  nextCursor: string | null;
}

export interface GetCardActivityQuery {
  limit?: number;
  cursor?: string;
}

export interface PaginatedActivitiesResult {
  items: import("./task").CardActivity[];
  nextCursor: string | null;
}

