import * as React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const boardName = board?.title || board?.name || "";

  React.useEffect(() => {
    if (isOpen) {
      setConfirmationInput("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !board) return null;

  const isConfirmed = confirmationInput.trim().toLowerCase() === boardName.trim().toLowerCase();

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
      setError(err instanceof Error ? err.message : "Failed to delete board");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-board-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs select-none"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-error-600">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-error-50 text-error-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="delete-board-title" className="text-sm font-bold text-neutral-900">
                Delete Board Permanently
              </h2>
              <p className="text-xs text-neutral-500">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning text */}
        <div className="rounded-xl border border-error-100 bg-error-50/60 p-3 text-xs text-error-800 leading-relaxed">
          You are about to permanently delete <strong className="font-semibold text-error-900">{boardName}</strong>. All lists, cards, and associated metadata will be erased.
        </div>

        {/* Confirmation Form */}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="confirmation-input"
              className="text-xs font-semibold text-neutral-700"
            >
              Type <span className="font-mono font-bold text-neutral-900">"{boardName}"</span> to confirm:
            </label>
            <Input
              id="confirmation-input"
              value={confirmationInput}
              onChange={(e) => {
                setConfirmationInput(e.target.value);
                if (error) setError("");
              }}
              placeholder={boardName}
              autoFocus
              className="h-9 text-xs"
            />
            {error && (
              <p className="text-[11px] font-medium text-error-600">{error}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!isConfirmed || isDeleting}
              className="bg-error-600 hover:bg-error-700 text-white gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Permanently</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
