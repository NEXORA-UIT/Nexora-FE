import * as React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { ConfirmDeleteBoardDialogProps } from "@/types";

export const ConfirmDeleteBoardDialog: React.FC<ConfirmDeleteBoardDialogProps> = ({
  board,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const [confirmationInput, setConfirmationInput] = React.useState("");
  const [error, setError] = React.useState("");

  const boardName = board?.name || board?.title || "";

  React.useEffect(() => {
    if (isOpen) {
      setConfirmationInput("");
      setError("");
    }
  }, [isOpen]);

  if (!board) return null;

  const isConfirmed = confirmationInput.trim() === boardName.trim();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      setError(`Please type "${boardName}" to confirm deletion.`);
      return;
    }

    try {
      await onConfirm(board.id, confirmationInput.trim());
      onClose();
    } catch (err) {
      setError(getUserFacingApiError(err, "Failed to delete Board."));
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
    >
      <DialogContent
        size="sm"
        aria-labelledby="delete-board-title"
        onEscapeKeyDown={(event) => {
          if (isDeleting) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isDeleting) event.preventDefault();
        }}
      >
        <form
          onSubmit={(event) => void handleConfirm(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-50 text-error-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle id="delete-board-title" className="text-sm font-bold text-neutral-900">
                  Delete Board Permanently
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-neutral-500">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close delete Board dialog"
                disabled={isDeleting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <p className="border-error-100 text-error-800 rounded-xl border bg-error-50/60 p-3 text-sm leading-relaxed">
              You are about to permanently delete{" "}
              <strong className="text-error-900 font-semibold">{boardName}</strong>. All lists,
              cards, and associated metadata will be erased.
            </p>
            <label
              htmlFor="confirmation-input"
              className="block space-y-1.5 text-xs font-semibold text-neutral-700"
            >
              <span>
                Type <span className="font-mono font-bold text-neutral-900">"{boardName}"</span> to
                confirm:
              </span>
              <Input
                id="confirmation-input"
                value={confirmationInput}
                onChange={(event) => {
                  setConfirmationInput(event.target.value);
                  if (error) setError("");
                }}
                placeholder={boardName}
                autoFocus
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-medium text-error-600">
                {error}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isConfirmed || isDeleting}
              className="hover:bg-error-700 gap-1.5 bg-error-600 text-white"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
