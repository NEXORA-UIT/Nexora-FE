import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MoreHorizontal, X, Link2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { KanbanCard, UpdateCardInput } from "@/types";

export interface CardDetailHeaderProps {
  card: KanbanCard;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onClose: () => void;
}

export const CardDetailHeader: React.FC<CardDetailHeaderProps> = ({
  card,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(card.title);
  const [isUpdatingTitle, setIsUpdatingTitle] = React.useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Sync draft title when card changes
  React.useEffect(() => {
    setTitleDraft(card.title);
    setIsEditingTitle(false);
  }, [card.id, card.title]);

  const handleCommitTitle = async () => {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === card.title) {
      setTitleDraft(card.title);
      return;
    }
    setIsUpdatingTitle(true);
    try {
      await onUpdate({
        title: trimmed,
        updatedAt: card.updatedAt,
      });
    } catch {
      setTitleDraft(card.title);
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Card link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(card.id);
      setIsConfirmingDelete(false);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3 pb-3">
      {/* Top Bar: Code Badge + Options + Close */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-md border border-neutral-200/80 bg-neutral-100 px-2 py-0.5 font-mono text-xs font-semibold text-neutral-600">
          {card.code}
        </span>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:bg-neutral-200"
                aria-label="More card actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Link2 className="h-3.5 w-3.5 text-neutral-500" />
                <span>Copy card link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClose}>
                <X className="h-3.5 w-3.5 text-neutral-500" />
                <span>Close panel</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onClick={() => setIsConfirmingDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete card</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 active:bg-neutral-200"
            aria-label="Close card details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editable Title */}
      <div className="relative">
        {isEditingTitle ? (
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => void handleCommitTitle()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleCommitTitle();
              } else if (e.key === "Escape") {
                setTitleDraft(card.title);
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            aria-label="Card title"
            className="w-full rounded-lg border border-primary-500 bg-white px-2 py-1 text-lg font-semibold text-neutral-900 shadow-xs outline-none ring-2 ring-primary-500/20 sm:text-xl"
          />
        ) : (
          <div className="group flex items-start gap-2">
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="flex-1 cursor-text rounded-lg px-2 py-1 -mx-2 text-lg font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 sm:text-xl leading-snug"
              title="Click to edit title"
            >
              {card.title}
            </h2>
            {isUpdatingTitle && (
              <Loader2 className="h-4 w-4 animate-spin text-primary-600 mt-2 shrink-0" />
            )}
          </div>
        )}
      </div>

      {/* Lightweight Delete Confirmation Dialog */}
      <Dialog.Root open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-2xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white p-5 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus:outline-none">
            <Dialog.Title className="text-base font-semibold text-neutral-900">
              Delete card?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-xs leading-relaxed text-neutral-600">
              This will permanently remove the card from the board. This action cannot be undone.
            </Dialog.Description>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                disabled={isDeleting}
                className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-error-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-error-500/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete card</span>
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
