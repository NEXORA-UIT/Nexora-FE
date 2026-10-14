import type {
  KanbanCard,
  KanbanList,
  BoardMember,
  ListCategory,
  UpdateCardInput,
  CardActivity,
  BoardLabel,
  PaginatedActivitiesResult,
} from "@/types";

export interface CardOperationsSectionProps {
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
}

export interface CardMetadataSectionProps {
  lists: KanbanList[];
  members: BoardMember[];
  boardLabels?: BoardLabel[];
  onStatusChange: (card: KanbanCard, targetCategory: ListCategory) => Promise<boolean>;
  onAssignMember?: (cardId: string, userId: string) => Promise<void>;
  onUnassignMember?: (cardId: string, userId: string) => Promise<void>;
  isLoadingAssignments?: boolean;
  assignmentsError?: string | null;
  onRetryAssignments?: () => void;
  onAttachLabel?: (cardId: string, labelId: string) => Promise<void>;
  onDetachLabel?: (cardId: string, labelId: string) => Promise<void>;
  isLoadingLabels?: boolean;
  labelsError?: string | null;
  onRetryLabels?: () => void;
}

export interface CardChecklistSectionProps {
  onAddItem: (cardId: string, title: string) => Promise<void>;
  onToggleItem: (cardId: string, taskId: string, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (cardId: string, taskId: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export interface CardDependenciesSectionProps {
  boardCards?: KanbanCard[];
  canManage?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onAddDependency?: (cardId: string, prerequisiteCardId: string) => Promise<void>;
  onDeleteDependency?: (cardId: string, dependencyId: string) => Promise<void>;
}

export interface CardAttachmentsSectionProps {
  onUploadAttachment?: (cardId: string, file: File) => Promise<void>;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  onDownloadAttachment?: (attachmentId: string) => Promise<Blob>;
  isLoadingAttachments?: boolean;
  attachmentsError?: string | null;
  onRetryAttachments?: () => void;
  isUploadingAttachment?: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  isWorkspaceOwner?: boolean;
}

export interface CardActivitySectionProps {
  onAddComment: (cardId: string, content: string) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isLoadingComments?: boolean;
  commentsError?: string | null;
  onRetryComments?: () => void;
  onFetchActivities: (
    cardId: string,
    cursor?: string
  ) => Promise<CardActivity[] | PaginatedActivitiesResult>;
  currentUserId?: string;
}
