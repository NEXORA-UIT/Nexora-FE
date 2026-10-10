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
