import * as React from "react";
import { Loader2, X } from "lucide-react";
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
import type { BoardDetail } from "@/types";

interface BoardSettingsDialogProps {
  board: BoardDetail;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: { name: string; description: string }) => Promise<void>;
}

export const BoardSettingsDialog: React.FC<BoardSettingsDialogProps> = ({
  board,
  isOpen,
  isSaving,
  onClose,
  onSave,
}) => {
  const [name, setName] = React.useState(board.name);
  const [description, setDescription] = React.useState(board.description ?? "");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setName(board.name);
    setDescription(board.description ?? "");
    setError(null);
  }, [board.description, board.name, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Board name is required.");
      return;
    }

    setError(null);
    try {
      await onSave({ name: cleanName, description: description.trim() });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save Board settings.");
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogContent
        size="md"
        aria-labelledby="board-settings-title"
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isSaving) event.preventDefault();
        }}
      >
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader>
            <div className="min-w-0 flex-1">
              <DialogTitle
                id="board-settings-title"
                className="text-base font-bold text-neutral-900"
              >
                Board settings
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-neutral-500">
                Edit the name and description for this Board.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close Board settings"
                disabled={isSaving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <label className="block space-y-1.5 text-xs font-semibold text-neutral-700">
              <span>Board name</span>
              <Input
                aria-label="Board name"
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
                disabled={isSaving}
                required
              />
            </label>
            <label className="block space-y-1.5 text-xs font-semibold text-neutral-700">
              <span>Description</span>
              <textarea
                aria-label="Description"
                value={description}
                maxLength={500}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSaving}
                rows={4}
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 disabled:bg-neutral-50"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-error-600">
                {error}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
