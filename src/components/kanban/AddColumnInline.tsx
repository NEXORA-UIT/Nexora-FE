import * as React from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListCategory } from "@/types";

export interface AddColumnInlineProps {
  onAdd: (name: string, category: ListCategory) => Promise<void> | void;
}

export const AddColumnInline: React.FC<AddColumnInlineProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    setIsSubmitting(true);
    try {
      await onAdd(cleanName, "TODO");
      setName("");
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-12 w-[320px] min-w-[320px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/60 text-xs font-semibold text-neutral-600 hover:border-neutral-400 hover:bg-neutral-100/70 hover:text-neutral-900 transition-all select-none"
      >
        <Plus className="h-4 w-4" />
        <span>Add another list</span>
      </button>
    );
  }

  return (
    <div className="w-[320px] min-w-[320px] shrink-0 rounded-2xl border border-neutral-300 bg-white p-3.5 shadow-sm space-y-3 select-none">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter list title..."
          className="h-8 w-full rounded-lg border border-neutral-200 px-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-hidden"
        />

        <div className="flex items-center justify-between">
          <Button
            type="submit"
            size="sm"
            disabled={!name.trim() || isSubmitting}
            className="h-7 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span>Add List</span>
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setName("");
              setIsOpen(false);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
