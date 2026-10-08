import * as React from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { KanbanCard } from "@/types";

export interface CardDetailChecklistProps {
  card: KanbanCard;
  onAddItem: (cardId: string, title: string) => Promise<void>;
  onToggleItem: (cardId: string, taskId: string, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (cardId: string, taskId: string) => Promise<void>;
}

export const CardDetailChecklist: React.FC<CardDetailChecklistProps> = ({
  card,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}) => {
  const [newTitle, setNewTitle] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const checklist = card.checklist || [];
  const total = checklist.length;
  const completed = checklist.filter((t) => t.isCompleted).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddItem(card.id, trimmed);
      setNewTitle("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 py-4 border-b border-neutral-200">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Checklist
          </h3>
          <span className="text-xs font-medium text-neutral-500">
            {completed}/{total} ({percentage}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist items or empty state */}
      {checklist.length > 0 ? (
        <div className="space-y-1 pt-1">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-md p-1.5 transition-colors hover:bg-neutral-50 focus-within:bg-neutral-50"
            >
              <label className="flex items-center gap-2.5 cursor-pointer text-xs flex-1 select-none">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={(e) => void onToggleItem(card.id, item.id, e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <span
                  className={`transition-colors ${
                    item.isCompleted ? "line-through text-neutral-400" : "text-neutral-800"
                  }`}
                >
                  {item.title}
                </span>
              </label>

              <button
                type="button"
                onClick={() => void onDeleteItem(card.id, item.id)}
                className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1.5 text-neutral-400 hover:text-error-600 focus:text-error-600 rounded transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                aria-label={`Remove checklist item: ${item.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-2 text-xs text-neutral-500">
          <p className="font-medium text-neutral-600">No checklist items yet.</p>
          <p className="text-neutral-400 mt-0.5">
            Add a task to break this card into smaller steps.
          </p>
        </div>
      )}

      {/* Inline Add Task Input */}
      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add an item..."
          aria-label="New checklist item"
          className="flex-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isSubmitting}
          className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
