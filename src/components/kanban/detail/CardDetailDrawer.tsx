import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CardDetailHeader } from "./CardDetailHeader";
import { CardDetailMetadata } from "./CardDetailMetadata";
import { CardDetailDescription } from "./CardDetailDescription";
import { CardDetailChecklist } from "./CardDetailChecklist";
import { CardDetailDependencies } from "./CardDetailDependencies";
import { CardDetailAttachments } from "./CardDetailAttachments";
import { CardDetailActivity } from "./CardDetailActivity";
import type { KanbanCard } from "@/types";
import type {
  CardOperationsSectionProps,
  CardMetadataSectionProps,
  CardChecklistSectionProps,
  CardDependenciesSectionProps,
  CardAttachmentsSectionProps,
  CardActivitySectionProps,
} from "./types";

export type * from "./types";

export interface CardDetailDrawerProps {
  card: KanbanCard | null;
  isOpen: boolean;
  onClose: () => void;

  // Domain-aligned section bundles
  operations: CardOperationsSectionProps;
  metadata: CardMetadataSectionProps;
  checklist: CardChecklistSectionProps;
  dependencies: CardDependenciesSectionProps;
  attachments: CardAttachmentsSectionProps;
  activity: CardActivitySectionProps;
}

export const CardDetailDrawer: React.FC<CardDetailDrawerProps> = ({
  card,
  isOpen,
  onClose,
  operations,
  metadata,
  checklist,
  dependencies,
  attachments,
  activity,
}) => {
  if (!card) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Soft Dimming Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-2xs transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Right-Side Slide-Over Panel Container */}
        <Dialog.Content
          data-no-pan
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-full sm:max-w-xl lg:max-w-2xl flex-col border-l border-neutral-200 bg-white shadow-2xl focus:outline-none transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        >
          {/* Accessible Dialog Title */}
          <Dialog.Title className="sr-only">
            Task details for {card.code}: {card.title}
          </Dialog.Title>

          {/* Pinned Sticky Header */}
          <div className="shrink-0 bg-white border-b border-neutral-200 px-4 sm:px-6 pt-4 pb-1">
            <CardDetailHeader
              card={card}
              onUpdate={operations.onUpdate}
              onDelete={operations.onDelete}
              onClose={onClose}
            />
          </div>

          {/* Independent Vertical Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-2 scrollbar-thin">
            {/* Core Metadata: Status select (moveCard), Priority, Assignee, Dates, Labels */}
            <CardDetailMetadata
              card={card}
              lists={metadata.lists}
              members={metadata.members}
              onStatusChange={metadata.onStatusChange}
              onUpdate={operations.onUpdate}
              onAssignMember={metadata.onAssignMember}
              onUnassignMember={metadata.onUnassignMember}
              isLoadingAssignments={metadata.isLoadingAssignments}
              assignmentsError={metadata.assignmentsError}
              onRetryAssignments={metadata.onRetryAssignments}
              boardLabels={metadata.boardLabels}
              onAttachLabel={metadata.onAttachLabel}
              onDetachLabel={metadata.onDetachLabel}
              isLoadingLabels={metadata.isLoadingLabels}
              labelsError={metadata.labelsError}
              onRetryLabels={metadata.onRetryLabels}
            />

            {/* Description: Debounced Autosave + Status Indicator */}
            <CardDetailDescription card={card} onUpdate={operations.onUpdate} />

            {/* Checklist Tasks: Progress bar, Counter, Toggles, Inline Add */}
            <CardDetailChecklist
              card={card}
              onAddItem={checklist.onAddItem}
              onToggleItem={checklist.onToggleItem}
              onDeleteItem={checklist.onDeleteItem}
              isLoading={checklist.isLoading}
              error={checklist.error}
              onRetry={checklist.onRetry}
            />

            {/* Dependencies & Prerequisites: Consistent Blocked Warning + Linked Cards */}
            <CardDetailDependencies
              card={card}
              boardCards={dependencies.boardCards}
              canManage={Boolean(dependencies.canManage)}
              isLoading={dependencies.isLoading}
              error={dependencies.error}
              onRetry={dependencies.onRetry}
              onAddDependency={
                dependencies.canManage && dependencies.onAddDependency
                  ? (prereqId) => dependencies.onAddDependency!(card.id, prereqId)
                  : undefined
              }
              onDeleteDependency={
                dependencies.canManage && dependencies.onDeleteDependency
                  ? (depId) => dependencies.onDeleteDependency!(card.id, depId)
                  : undefined
              }
            />

            {/* Attachments: Upload, download, delete, and list */}
            <CardDetailAttachments
              card={card}
              onUploadAttachment={attachments.onUploadAttachment}
              onDeleteAttachment={attachments.onDeleteAttachment}
              onDownloadAttachment={attachments.onDownloadAttachment}
              isLoadingAttachments={attachments.isLoadingAttachments}
              attachmentsError={attachments.attachmentsError}
              onRetryAttachments={attachments.onRetryAttachments}
              isUploadingAttachment={attachments.isUploadingAttachment}
              currentUserId={attachments.currentUserId}
              currentUserRole={attachments.currentUserRole}
              isWorkspaceOwner={attachments.isWorkspaceOwner}
            />

            {/* Activity & Comments: Radix tabs + Lazy-loaded activity audit stream */}
            <CardDetailActivity
              card={card}
              onAddComment={activity.onAddComment}
              onFetchActivities={activity.onFetchActivities}
              onFetchGitActivity={activity.onFetchGitActivity}
              onUpdateComment={activity.onUpdateComment}
              onDeleteComment={activity.onDeleteComment}
              isLoadingComments={activity.isLoadingComments}
              commentsError={activity.commentsError}
              onRetryComments={activity.onRetryComments}
              currentUserId={activity.currentUserId}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
