import type { BoardMember } from "./board";

export type CardPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ListCategory = "TODO" | "IN_PROGRESS" | "DONE";

export interface BoardLabel {
  id: string;
  boardId: string;
  name: string;
  color?: string;
}

export interface KanbanCard {
  id: string;
  listId: string;
  boardId: string;
  code: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  priority: CardPriority;
  position: number;
  status: "ACTIVE" | "ARCHIVED";
  assignees: BoardMember[];
  labels: BoardLabel[];
  tasksCount: number;
  completedTasksCount: number;
  isBlocked?: boolean;
  blockReason?: string;
  updatedAt: string;
  createdAt: string;
}

export interface KanbanList {
  id: string;
  boardId: string;
  name: string;
  category: ListCategory;
  position: number;
  status: "ACTIVE" | "ARCHIVED";
  cards: KanbanCard[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardDetail {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "ARCHIVED";
  members: BoardMember[];
  labels: BoardLabel[];
  lists: KanbanList[];
  updatedAt: string;
  createdAt: string;
}

export interface CreateCardInput {
  title: string;
  description?: string;
  priority?: CardPriority;
  dueDate?: string;
  assigneeIds?: string[];
  labelIds?: string[];
}

export interface MoveCardInput {
  targetListId: string;
  position: number;
  updatedAt: string;
}

export interface CreateListInput {
  name: string;
  category: ListCategory;
}

export interface ReorderListInput {
  position: number;
}
