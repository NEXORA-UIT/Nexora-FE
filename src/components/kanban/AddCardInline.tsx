import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AddCardInlineProps {
  onAdd: (title: string) => Promise<void> | void;
  onCancel: () => void;
}

export const AddCardInline: React.FC<AddCardInlineProps> = ({
  onAdd,
  onCancel,
}) => {
  const [title, setTitle] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setIsSubmitting(true);
    try {
      await onAdd(cleanTitle);
      setTitle("");
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-neutral-300 bg-white p-2.5 shadow-xs">
      <textarea
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter card title..."
        rows={2}
        className="w-full resize-none bg-transparent text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden"
      />

      <div className="flex items-center justify-between pt-1">
        <Button
          type="submit"
          size="sm"
          disabled={!title.trim() || isSubmitting}
          className="h-7 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700"
        >
          {isSubmitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span>Add Card</span>
          )}
        </Button>

        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};
