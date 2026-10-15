import type { BoardMember } from "./board";
import type {
  ChecklistItem,
  CardDependency,
  CardAttachment,
  CardComment,
} from "./task";

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
  statusGroup?: ListCategory;
  assignees: BoardMember[];
  labels: BoardLabel[];
  tasksCount: number;
  completedTasksCount: number;
  isBlocked?: boolean;
  blockReason?: string;
  checklist?: ChecklistItem[];
  dependencies?: CardDependency[];
  attachments?: CardAttachment[];
  comments?: CardComment[];
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
  archivedListsCount?: number;
  updatedAt: string;
  createdAt: string;
}

export interface CreateCardInput {
  title: string;
  description?: string | null;
  priority?: CardPriority;
  startDate?: string | null;
  dueDate?: string | null;
  assigneeIds?: string[];
  labelIds?: string[];
}

export interface UpdateCardInput {
  title?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: CardPriority;
  assigneeIds?: string[];
  labelIds?: string[];
  updatedAt: string; // Required for OCC concurrency check
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

export interface UpdateListInput {
  name?: string;
  category?: ListCategory;
}
