import type { BoardMember } from "./board";
import type { CardPriority } from "./kanban";

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

export interface ChecklistItem {
  id: string;
  cardId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardDependency {
  id: string;
  cardId: string;
  prerequisiteCardId: string;
  prerequisiteCode: string;
  prerequisiteTitle: string;
  prerequisiteStatus: "TODO" | "IN_PROGRESS" | "DONE";
  isCompleted: boolean;
}

export interface CardAttachment {
  id: string;
  cardId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: BoardMember;
  uploadedAt?: string;
}

export interface CardComment {
  id: string;
  cardId: string;
  author: BoardMember;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CardActivity {
  id: string;
  cardId: string;
  user: BoardMember;
  action: string;
  createdAt: string;
}
