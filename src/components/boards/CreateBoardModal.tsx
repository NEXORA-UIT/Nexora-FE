import * as React from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  if (!isOpen) return null;

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
        title: cleanTitle,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create board"
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-board-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-200/80 animate-in zoom-in-95 duration-150 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="create-board-modal-title"
                className="text-base font-bold text-neutral-900"
              >
                Create New Board
              </h2>
              <p className="text-xs text-neutral-500">
                Add a new project board to Core Platform
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="board-title-input"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Board Title <span className="text-error-500">*</span>
            </label>
            <Input
              id="board-title-input"
              type="text"
              placeholder="e.g. Website Redesign"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              required
              className="h-9.5 text-xs rounded-xl"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="board-description-input"
              className="block text-xs font-semibold text-neutral-700 mb-1"
            >
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="board-description-input"
              rows={3}
              placeholder="Brief description of goals, scope, and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
            />
          </div>

          {error && (
            <p className="text-xs text-error-600 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl text-xs bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Board</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
