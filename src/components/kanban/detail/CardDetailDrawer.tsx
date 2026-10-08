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
  onFetchActivities: (cardId: string) => Promise<CardActivity[]>;
  boardCards?: KanbanCard[];
  canManageDependencies?: boolean;
  onAddDependency?: (cardId: string, prerequisiteCardId: string) => Promise<void>;
  onDeleteDependency?: (cardId: string, dependencyId: string) => Promise<void>;
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
  onFetchActivities,
  boardCards = [],
  canManageDependencies = false,
  onAddDependency,
  onDeleteDependency,
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
              onUpdate={onUpdate}
              onDelete={onDelete}
              onClose={onClose}
            />
          </div>

          {/* Independent Vertical Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-2 scrollbar-thin">
            {/* Core Metadata: Status select (moveCard), Priority, Assignee, Dates, Labels */}
            <CardDetailMetadata
              card={card}
              lists={lists}
              members={members}
              onStatusChange={onStatusChange}
              onUpdate={onUpdate}
            />

            {/* Description: Debounced Autosave + Status Indicator */}
            <CardDetailDescription card={card} onUpdate={onUpdate} />

            {/* Checklist Tasks: Progress bar, Counter, Toggles, Inline Add */}
            <CardDetailChecklist
              card={card}
              onAddItem={onAddChecklistItem}
              onToggleItem={onToggleChecklistItem}
              onDeleteItem={onDeleteChecklistItem}
            />

            {/* Dependencies & Prerequisites: Consistent Blocked Warning + Linked Cards */}
            <CardDetailDependencies
              card={card}
              boardCards={boardCards}
              canManage={Boolean(canManageDependencies)}
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

            {/* Attachments: Read-only preview cards + disabled upload indicator */}
            <CardDetailAttachments card={card} />

            {/* Activity & Comments: Radix tabs + Lazy-loaded activity audit stream */}
            <CardDetailActivity
              card={card}
              onAddComment={onAddComment}
              onFetchActivities={onFetchActivities}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
