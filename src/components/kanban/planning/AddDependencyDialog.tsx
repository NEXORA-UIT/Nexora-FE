import * as React from "react";
import { Search, X, Loader2, AlertCircle, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserFacingApiError } from "@/utils/api-error-message";
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
  const existingPrereqIds = new Set((card.dependencies || []).map((d) => d.prerequisiteCardId));

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
      setError(getUserFacingApiError(err, "Failed to add dependency."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onOpenChange(false);
      }}
    >
      <DialogContent
        size="md"
        aria-labelledby="add-dependency-title"
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="text-primary-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
              <Link2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle
                id="add-dependency-title"
                className="text-sm font-semibold text-neutral-900"
              >
                Add prerequisite dependency
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-neutral-500">
                Select a prerequisite card that must be completed before {card.code}.
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
              aria-label="Close dependency dialog"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogBody className="space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search cards by code or title..."
                className="h-10 pl-9"
                aria-label="Search cards"
              />
            </div>
            {error && (
              <div
                role="alert"
                className="border-error-200 text-error-800 flex items-center gap-2 rounded-lg border bg-error-50 p-3 text-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-error-600" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            <div className="scrollbar-thin min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
              {candidateCards.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">
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
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                        isCyclic
                          ? "cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-50"
                          : isSelected
                            ? "text-primary-950 border-primary-500 bg-primary-50/60"
                            : "border-neutral-200 text-neutral-800 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 rounded border border-neutral-200 bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-600">
                          {candidate.code}
                        </span>
                        <span className="truncate font-medium">{candidate.title}</span>
                      </span>
                      {isCyclic ? (
                        <span className="border-error-200 shrink-0 rounded border bg-error-50 px-2 py-0.5 text-[10px] font-semibold text-error-600">
                          Causes cycle
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs text-neutral-400">
                          {candidate.priority}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedCardId || isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Adding..." : "Add dependency"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
