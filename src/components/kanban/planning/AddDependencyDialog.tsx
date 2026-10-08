import * as React from "react";
import { Search, X, Loader2, AlertCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KanbanCard } from "@/types";
import { wouldCreateCycle } from "@/utils";

export interface AddDependencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: KanbanCard;
  boardCards: KanbanCard[];
  onAddDependency: (prerequisiteCardId: string) => Promise<void>;
}

export const AddDependencyDialog: React.FC<AddDependencyDialogProps> = ({
  open,
  onOpenChange,
  card,
  boardCards,
  onAddDependency,
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedCardId(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  // Existing prerequisite IDs on this card
  const existingPrereqIds = new Set(
    (card.dependencies || []).map((d) => d.prerequisiteCardId)
  );

  // Eligible candidate cards
  const candidateCards = boardCards.filter((c) => {
    // Cannot depend on self
    if (c.id === card.id) return false;
    // Cannot depend on already linked prerequisite
    if (existingPrereqIds.has(c.id)) return false;
    // Lifecycle status must be active
    if (c.status !== "ACTIVE") return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesCode = c.code.toLowerCase().includes(q);
      const matchesTitle = c.title.toLowerCase().includes(q);
      return matchesCode || matchesTitle;
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddDependency(selectedCardId);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add dependency");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-dependency-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-2xs select-none"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-6 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <h2 id="add-dependency-title" className="text-sm font-semibold text-neutral-900">
                Add Prerequisite Dependency
              </h2>
              <p className="text-xs text-neutral-500">
                Select a prerequisite card that must be completed before {card.code}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards by code or title..."
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-error-200 bg-error-50 p-2.5 text-xs text-error-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-error-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Cards List */}
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {candidateCards.length === 0 ? (
              <p className="py-6 text-center text-xs text-neutral-400 italic">
                {searchQuery ? "No matching cards found." : "No available prerequisite cards."}
              </p>
            ) : (
              candidateCards.map((candidate) => {
                const isCyclic = wouldCreateCycle(card.id, candidate.id, boardCards);
                const isSelected = selectedCardId === candidate.id;

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    disabled={isCyclic || isSubmitting}
                    onClick={() => setSelectedCardId(candidate.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      isCyclic
                        ? "opacity-50 cursor-not-allowed bg-neutral-50 border-neutral-200"
                        : isSelected
                          ? "border-primary-500 bg-primary-50/60 text-primary-950"
                          : "border-neutral-200 hover:bg-neutral-50 text-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono text-[11px] font-semibold text-neutral-600 rounded bg-white px-1.5 py-0.5 border border-neutral-200 shrink-0">
                        {candidate.code}
                      </span>
                      <span className="font-medium truncate">{candidate.title}</span>
                    </div>

                    <div className="shrink-0">
                      {isCyclic ? (
                        <span className="text-[10px] font-semibold text-error-600 bg-error-50 px-2 py-0.5 rounded border border-error-200">
                          Causes cycle
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">
                          {candidate.priority}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedCardId || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Dependency"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
