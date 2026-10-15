import * as React from "react";
import { Tag, Loader2, Check, AlertCircle } from "lucide-react";
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
  isLoadingLabels?: boolean;
  labelsError?: string | null;
  onRetryLabels?: () => void;
}

export const CardLabelSelector: React.FC<CardLabelSelectorProps> = ({
  cardId,
  cardLabels,
  boardLabels = [],
  onAttachLabel,
  onDetachLabel,
  isLoadingLabels = false,
  labelsError = null,
  onRetryLabels,
}) => {
  const [pendingLabelId, setPendingLabelId] = React.useState<string | null>(null);

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
          <DropdownMenu>
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
            <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
              <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">
                Board Labels
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
                      className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer text-xs"
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
