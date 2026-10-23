import * as React from "react";
import type {
  KanbanCard,
  KanbanList,
  BoardMember,
  ListCategory,
  UpdateCardInput,
  BoardLabel,
} from "@/types";
import {
  CardStatusSelector,
  CardPrioritySelector,
  CardAssigneeSelector,
  CardDateFields,
  CardLabelSelector,
} from "./metadata";

export interface CardDetailMetadataProps {
  card: KanbanCard;
  lists: KanbanList[];
  members: BoardMember[];
  onStatusChange: (card: KanbanCard, targetCategory: ListCategory) => Promise<boolean>;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
  onAssignMember?: (cardId: string, userId: string) => Promise<void>;
  onUnassignMember?: (cardId: string, userId: string) => Promise<void>;
  isLoadingAssignments?: boolean;
  assignmentsError?: string | null;
  onRetryAssignments?: () => void;
  boardLabels?: BoardLabel[];
  onAttachLabel?: (cardId: string, labelId: string) => Promise<void>;
  onDetachLabel?: (cardId: string, labelId: string) => Promise<void>;
  onCreateBoardLabel?: (name: string, color: string) => Promise<BoardLabel | void>;
  isLoadingLabels?: boolean;
  labelsError?: string | null;
  onRetryLabels?: () => void;
}

export const CardDetailMetadata: React.FC<CardDetailMetadataProps> = ({
  card,
  lists,
  members,
  onStatusChange,
  onUpdate,
  onAssignMember,
  onUnassignMember,
  isLoadingAssignments = false,
  assignmentsError = null,
  onRetryAssignments,
  boardLabels = [],
  onAttachLabel,
  onDetachLabel,
  onCreateBoardLabel,
  isLoadingLabels = false,
  labelsError = null,
  onRetryLabels,
}) => {
  return (
    <div className="grid grid-cols-1 gap-y-3 py-4 text-xs sm:grid-cols-2 sm:gap-x-8 border-b border-neutral-200">
      {/* Column 1 */}
      <div className="space-y-3">
        <CardStatusSelector
          card={card}
          lists={lists}
          onStatusChange={onStatusChange}
        />
        <CardPrioritySelector
          priority={card.priority}
          cardUpdatedAt={card.updatedAt}
          onUpdate={onUpdate}
        />
        <CardAssigneeSelector
          cardId={card.id}
          assignees={card.assignees}
          members={members}
          onAssignMember={onAssignMember}
          onUnassignMember={onUnassignMember}
          isLoadingAssignments={isLoadingAssignments}
          assignmentsError={assignmentsError}
          onRetryAssignments={onRetryAssignments}
        />
      </div>

      {/* Column 2 */}
      <div className="space-y-3">
        <CardDateFields
          startDate={card.startDate}
          dueDate={card.dueDate}
          cardUpdatedAt={card.updatedAt}
          onUpdate={onUpdate}
        />
        <CardLabelSelector
          cardId={card.id}
          cardLabels={card.labels}
          boardLabels={boardLabels}
          onAttachLabel={onAttachLabel}
          onDetachLabel={onDetachLabel}
          onCreateBoardLabel={onCreateBoardLabel}
          isLoadingLabels={isLoadingLabels}
          labelsError={labelsError}
          onRetryLabels={onRetryLabels}
        />
      </div>
    </div>
  );
};
