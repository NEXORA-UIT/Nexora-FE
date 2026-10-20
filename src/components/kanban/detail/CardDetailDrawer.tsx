import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CardDetailHeader } from "./CardDetailHeader";
import { CardDetailMetadata } from "./CardDetailMetadata";
import { CardDetailDescription } from "./CardDetailDescription";
import { CardDetailChecklist } from "./CardDetailChecklist";
import { CardDetailDependencies } from "./CardDetailDependencies";
import { CardDetailAttachments } from "./CardDetailAttachments";
import { CardDetailActivity } from "./CardDetailActivity";
import type {
  KanbanCard,
  KanbanList,
  BoardMember,
  ListCategory,
  UpdateCardInput,
  CardActivity,
  BoardLabel,
  PaginatedActivitiesResult,
  GitActivityFeed,
} from "@/types";

export interface CardDetailDrawerProps {
  card: KanbanCard | null;
  isOpen: boolean;
  lists: KanbanList[];
  members: BoardMember[];
  onClose: () => void;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
  onStatusChange: (card: KanbanCard, targetCategory: ListCategory) => Promise<boolean>;
  onDelete: (cardId: string) => Promise<void>;
  onAddChecklistItem: (cardId: string, title: string) => Promise<void>;
  onToggleChecklistItem: (cardId: string, taskId: string, isCompleted: boolean) => Promise<void>;
  onDeleteChecklistItem: (cardId: string, taskId: string) => Promise<void>;
  onAddComment: (cardId: string, content: string) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  isLoadingComments?: boolean;
  commentsError?: string | null;
  onRetryComments?: () => void;
  currentUserId?: string;
  onFetchActivities: (
    cardId: string,
    cursor?: string
  ) => Promise<CardActivity[] | PaginatedActivitiesResult>;
  boardCards?: KanbanCard[];
  canManageDependencies?: boolean;
  onAddDependency?: (cardId: string, prerequisiteCardId: string) => Promise<void>;
  onDeleteDependency?: (cardId: string, dependencyId: string) => Promise<void>;
  isLoadingDependencies?: boolean;
  dependenciesError?: string | null;
  onRetryDependencies?: () => void;
  isLoadingTasks?: boolean;
  tasksError?: string | null;
  onRetryTasks?: () => void;
  onAssignMember?: (cardId: string, userId: string) => Promise<void>;
  onUnassignMember?: (cardId: string, userId: string) => Promise<void>;
  isLoadingAssignments?: boolean;
  assignmentsError?: string | null;
  onRetryAssignments?: () => void;
  boardLabels?: BoardLabel[];
  onAttachLabel?: (cardId: string, labelId: string) => Promise<void>;
  onDetachLabel?: (cardId: string, labelId: string) => Promise<void>;
  isLoadingLabels?: boolean;
  labelsError?: string | null;
  onRetryLabels?: () => void;
  onUploadAttachment?: (cardId: string, file: File) => Promise<void>;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  onDownloadAttachment?: (attachmentId: string) => Promise<Blob>;
  isLoadingAttachments?: boolean;
  attachmentsError?: string | null;
  onRetryAttachments?: () => void;
  isUploadingAttachment?: boolean;
  currentUserRole?: string;
  isWorkspaceOwner?: boolean;
  onFetchGitActivity?: (cardId: string, cardCode: string) => Promise<GitActivityFeed>;
}

export const CardDetailDrawer: React.FC<CardDetailDrawerProps> = ({
  card,
  isOpen,
  lists,
  members,
  onClose,
  onUpdate,
  onStatusChange,
  onDelete,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  isLoadingComments = false,
  commentsError = null,
  onRetryComments,
  currentUserId,
  onFetchActivities,
  boardCards = [],
  canManageDependencies = false,
  onAddDependency,
  onDeleteDependency,
  isLoadingDependencies = false,
  dependenciesError = null,
  onRetryDependencies,
  isLoadingTasks = false,
  tasksError = null,
  onRetryTasks,
  onAssignMember,
  onUnassignMember,
  isLoadingAssignments = false,
  assignmentsError = null,
  onRetryAssignments,
  boardLabels = [],
  onAttachLabel,
  onDetachLabel,
  isLoadingLabels = false,
  labelsError = null,
  onRetryLabels,
  onUploadAttachment,
  onDeleteAttachment,
  onDownloadAttachment,
  isLoadingAttachments = false,
  attachmentsError = null,
  onRetryAttachments,
  isUploadingAttachment = false,
  currentUserRole,
  isWorkspaceOwner = false,
  onFetchGitActivity,
}) => {
  if (!card) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Soft Dimming Backdrop */}
        <Dialog.Overlay className="backdrop-blur-2xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-40 bg-neutral-900/40 transition-opacity duration-200" />

        {/* Right-Side Slide-Over Panel Container */}
        <Dialog.Content
          data-no-pan
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col border-l border-neutral-200 bg-white shadow-2xl transition-all duration-200 focus:outline-none sm:max-w-xl lg:max-w-2xl"
        >
          {/* Accessible Dialog Title */}
          <Dialog.Title className="sr-only">
            Task details for {card.code}: {card.title}
          </Dialog.Title>

          {/* Pinned Sticky Header */}
          <div className="shrink-0 border-b border-neutral-200 bg-white px-4 pb-1 pt-4 sm:px-6">
            <CardDetailHeader
              card={card}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onClose={onClose}
            />
          </div>

          {/* Independent Vertical Scroll Area */}
          <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto px-4 py-2 sm:px-6">
            {/* Core Metadata: Status select (moveCard), Priority, Assignee, Dates, Labels */}
            <CardDetailMetadata
              card={card}
              lists={lists}
              members={members}
              onStatusChange={onStatusChange}
              onUpdate={onUpdate}
              onAssignMember={onAssignMember}
              onUnassignMember={onUnassignMember}
              isLoadingAssignments={isLoadingAssignments}
              assignmentsError={assignmentsError}
              onRetryAssignments={onRetryAssignments}
              boardLabels={boardLabels}
              onAttachLabel={onAttachLabel}
              onDetachLabel={onDetachLabel}
              isLoadingLabels={isLoadingLabels}
              labelsError={labelsError}
              onRetryLabels={onRetryLabels}
            />

            {/* Description: Debounced Autosave + Status Indicator */}
            <CardDetailDescription card={card} onUpdate={onUpdate} />

            {/* Checklist Tasks: Progress bar, Counter, Toggles, Inline Add */}
            <CardDetailChecklist
              card={card}
              onAddItem={onAddChecklistItem}
              onToggleItem={onToggleChecklistItem}
              onDeleteItem={onDeleteChecklistItem}
              isLoading={isLoadingTasks}
              error={tasksError}
              onRetry={onRetryTasks}
            />

            {/* Dependencies & Prerequisites: Consistent Blocked Warning + Linked Cards */}
            <CardDetailDependencies
              card={card}
              boardCards={boardCards}
              canManage={Boolean(canManageDependencies)}
              isLoading={isLoadingDependencies}
              error={dependenciesError}
              onRetry={onRetryDependencies}
              onAddDependency={
                canManageDependencies && onAddDependency
                  ? (prereqId) => onAddDependency(card.id, prereqId)
                  : undefined
              }
              onDeleteDependency={
                canManageDependencies && onDeleteDependency
                  ? (depId) => onDeleteDependency(card.id, depId)
                  : undefined
              }
            />

            {/* Attachments: Upload, download, delete, and list */}
            <CardDetailAttachments
              card={card}
              onUploadAttachment={onUploadAttachment}
              onDeleteAttachment={onDeleteAttachment}
              onDownloadAttachment={onDownloadAttachment}
              isLoadingAttachments={isLoadingAttachments}
              attachmentsError={attachmentsError}
              onRetryAttachments={onRetryAttachments}
              isUploadingAttachment={isUploadingAttachment}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isWorkspaceOwner={isWorkspaceOwner}
            />

            {/* Activity & Comments: Radix tabs + Lazy-loaded activity audit stream */}
            <CardDetailActivity
              card={card}
              onAddComment={onAddComment}
              onFetchActivities={onFetchActivities}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              isLoadingComments={isLoadingComments}
              commentsError={commentsError}
              onRetryComments={onRetryComments}
              currentUserId={currentUserId}
              onFetchGitActivity={onFetchGitActivity}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
