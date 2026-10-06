import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import type { KanbanCard, UpdateCardInput } from "@/types";

export interface CardDetailDescriptionProps {
  card: KanbanCard;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
}

export const CardDetailDescription: React.FC<CardDetailDescriptionProps> = ({
  card,
  onUpdate,
}) => {
  const [descriptionDraft, setDescriptionDraft] = React.useState(card.description || "");
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "unsaved" | "saving" | "saved">("idle");
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Sync draft when card changes
  React.useEffect(() => {
    setDescriptionDraft(card.description || "");
    setSaveStatus("idle");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, [card.id, card.description]);

  const commitSave = React.useCallback(
    async (text: string) => {
      if (text === (card.description || "")) {
        setSaveStatus("idle");
        return;
      }
      setSaveStatus("saving");
      try {
        await onUpdate({
          description: text,
          updatedAt: card.updatedAt,
        });
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
        }, 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [card.description, card.updatedAt, onUpdate]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setDescriptionDraft(nextVal);
    setSaveStatus("unsaved");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void commitSave(nextVal);
    }, 1000);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (descriptionDraft !== (card.description || "")) {
      void commitSave(descriptionDraft);
    }
  };

  return (
    <div className="space-y-2 py-4 border-b border-neutral-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Description
        </h3>

        {/* Visual Autosave Status Indicator */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {saveStatus === "unsaved" && (
            <span className="text-neutral-400">Unsaved changes...</span>
          )}
          {saveStatus === "saving" && (
            <span className="inline-flex items-center gap-1 text-primary-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <Check className="h-3 w-3" />
              <span>Auto-saved</span>
            </span>
          )}
        </div>
      </div>

      <textarea
        value={descriptionDraft}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Add a detailed description for this task..."
        rows={4}
        className="w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 text-xs leading-relaxed text-neutral-800 placeholder:text-neutral-400 transition-colors focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
  );
};
