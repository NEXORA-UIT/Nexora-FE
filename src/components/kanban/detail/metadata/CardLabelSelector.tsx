import * as React from "react";
import { Tag, Loader2, Check, AlertCircle, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CardTagBadge } from "../../CardTagBadge";
import type { BoardLabel } from "@/types";

export interface CardLabelSelectorProps {
  cardId: string;
  cardLabels: BoardLabel[];
  boardLabels?: BoardLabel[];
  onAttachLabel?: (cardId: string, labelId: string) => Promise<void>;
  onDetachLabel?: (cardId: string, labelId: string) => Promise<void>;
  onCreateBoardLabel?: (name: string, color: string) => Promise<BoardLabel | void>;
  isLoadingLabels?: boolean;
  labelsError?: string | null;
  onRetryLabels?: () => void;
}

const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Slate
];

export const CardLabelSelector: React.FC<CardLabelSelectorProps> = ({
  cardId,
  cardLabels,
  boardLabels = [],
  onAttachLabel,
  onDetachLabel,
  onCreateBoardLabel,
  isLoadingLabels = false,
  labelsError = null,
  onRetryLabels,
}) => {
  const [pendingLabelId, setPendingLabelId] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newLabelName, setNewLabelName] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState(PRESET_COLORS[5]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleToggleLabel = async (lbl: BoardLabel, isAttached: boolean) => {
    if (pendingLabelId) return;
    setPendingLabelId(lbl.id);
    try {
      if (isAttached) {
        if (onDetachLabel) {
          await onDetachLabel(cardId, lbl.id);
        }
      } else {
        if (onAttachLabel) {
          await onAttachLabel(cardId, lbl.id);
        }
      }
    } finally {
      setPendingLabelId(null);
    }
  };

  const handleCreateLabel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newLabelName.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onCreateBoardLabel) {
        const created = await onCreateBoardLabel(trimmed, selectedColor);
        if (created && onAttachLabel) {
          await onAttachLabel(cardId, created.id);
        }
      }
      setNewLabelName("");
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
          <Tag className="h-3.5 w-3.5" />
          <span>Labels</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {cardLabels.map((lbl) => (
            <CardTagBadge key={lbl.id} label={lbl.name} color={lbl.color} />
          ))}
          <DropdownMenu onOpenChange={(open) => { if (!open) { setIsCreating(false); setNewLabelName(""); } }}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={isLoadingLabels}
                aria-label="Manage labels"
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60"
              >
                {isLoadingLabels ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin text-neutral-400" />
                ) : (
                  <span>+ Label</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto p-2">
              <div className="flex items-center justify-between pb-1.5">
                <DropdownMenuLabel className="text-xs text-neutral-600 font-semibold p-0">
                  {isCreating ? "Create Board Label" : "Board Labels"}
                </DropdownMenuLabel>
              </div>
              <DropdownMenuSeparator className="mb-2" />

              {isCreating ? (
                <div
                  className="space-y-2.5 p-1"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <div>
                    <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                      Label name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Bug, Feature, Documentation"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleCreateLabel();
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`h-5 w-5 rounded-full flex items-center justify-center transition-transform ${
                            selectedColor === c ? "ring-2 ring-offset-1 ring-neutral-800 scale-110" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: c }}
                        >
                          {selectedColor === c && <Check className="h-3 w-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewLabelName("");
                      }}
                      className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!newLabelName.trim() || isSubmitting}
                      onClick={() => void handleCreateLabel()}
                      className="px-2.5 py-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-md transition-colors"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Create label"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {boardLabels.length === 0 ? (
                    <div className="px-2 py-3 text-center text-xs text-neutral-400">
                      No board labels available
                    </div>
                  ) : (
                    boardLabels.map((lbl) => {
                      const isAttached = cardLabels.some((l) => l.id === lbl.id);
                      const isPending = pendingLabelId === lbl.id;
                      return (
                        <DropdownMenuItem
                          key={lbl.id}
                          disabled={Boolean(pendingLabelId)}
                          onSelect={(e) => {
                            e.preventDefault();
                            void handleToggleLabel(lbl, isAttached);
                          }}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer text-xs rounded-md"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {lbl.color && (
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: lbl.color }}
                              />
                            )}
                            <span className="truncate font-medium text-neutral-800">
                              {lbl.name}
                            </span>
                          </div>
                          <div className="shrink-0 flex items-center w-4 h-4 justify-center">
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                            ) : isAttached ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : null}
                          </div>
                        </DropdownMenuItem>
                      );
                    })
                  )}

                  {onCreateBoardLabel && (
                    <div className="pt-1.5 mt-1 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsCreating(true);
                        }}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{boardLabels.length === 0 ? "Create label" : "Create new label"}</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Labels Error / Retry Banner */}
      {labelsError && (
        <div className="flex items-center gap-1.5 pl-24 text-[11px] text-amber-700">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{labelsError}</span>
          {onRetryLabels && (
            <button
              type="button"
              onClick={onRetryLabels}
              className="font-medium underline hover:text-amber-800 shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};
