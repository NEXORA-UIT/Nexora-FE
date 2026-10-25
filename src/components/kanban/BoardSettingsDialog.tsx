import * as React from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section className="w-full max-w-lg space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="board-settings-title" className="text-base font-bold text-neutral-900">
              Board settings
            </h2>
            <p className="mt-1 text-xs text-neutral-500">Edit the name and description for this Board.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
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
          {error && <p role="alert" className="text-sm text-error-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
