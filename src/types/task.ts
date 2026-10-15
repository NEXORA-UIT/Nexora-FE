import type { BoardMember } from "./board";

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
  userId?: string;
  fileName: string;
  fileUrl?: string;
  fileSize: number | string;
  mimeType?: string | null;
  uploadedBy: BoardMember;
  createdAt?: string;
  uploadedAt?: string;
}

export interface CardComment {
  id: string;
  cardId: string;
  userId?: string;
  author: BoardMember;
  content: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  isDeleted?: boolean;
}

export interface CardActivity {
  id: string;
  cardId: string;
  user: BoardMember;
  action: string;
  createdAt: string;
}

export interface PaginatedActivitiesResult {
  items: CardActivity[];
  nextCursor: string | null;
}
