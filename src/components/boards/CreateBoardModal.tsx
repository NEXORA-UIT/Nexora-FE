import * as React from "react";
import { Plus, X, Loader2 } from "lucide-react";
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
import type { CreateBoardModalProps } from "@/types";

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  workspaceId,
  isSubmitting,
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Please provide a board title.");
      return;
    }

    try {
      await onSubmit({
        workspaceId,
        name: cleanTitle,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(getUserFacingApiError(err, "Failed to create board."));
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        size="md"
        aria-labelledby="create-board-modal-title"
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="text-primary-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle
                  id="create-board-modal-title"
                  className="text-base font-bold text-neutral-900"
                >
                  Create New Board
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-neutral-500">
                  Add a new project board to Core Platform.
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close Create Board"
                disabled={isSubmitting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <label
              htmlFor="board-title-input"
              className="block space-y-1.5 text-xs font-semibold text-neutral-700"
            >
              <span>
                Board title <span className="text-error-500">*</span>
              </span>
              <Input
                id="board-title-input"
                type="text"
                placeholder="e.g. Website Redesign"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (error) setError("");
                }}
                required
                autoFocus
              />
            </label>
            <label
              htmlFor="board-description-input"
              className="block space-y-1.5 text-xs font-semibold text-neutral-700"
            >
              <span>
                Description <span className="font-normal text-neutral-400">(optional)</span>
              </span>
              <textarea
                id="board-description-input"
                rows={3}
                placeholder="Brief description of goals, scope, and objectives..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-medium text-error-600">
                {error}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
