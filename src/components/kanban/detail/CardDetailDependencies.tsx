import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock, Trash2, Plus } from "lucide-react";
import type { KanbanCard } from "@/types";
import { AddDependencyDialog } from "../planning/AddDependencyDialog";

export interface CardDetailDependenciesProps {
  card: KanbanCard;
  boardCards?: KanbanCard[];
  canManage?: boolean;
  onAddDependency?: (prerequisiteCardId: string) => Promise<void>;
  onDeleteDependency?: (dependencyId: string) => Promise<void>;
}

export const CardDetailDependencies: React.FC<CardDetailDependenciesProps> = ({
  card,
  boardCards = [],
  canManage = false,
  onAddDependency,
  onDeleteDependency,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const dependencies = card.dependencies || [];

  const handleDelete = async (depId: string) => {
    if (!onDeleteDependency || deletingId) return;
    setDeletingId(depId);
    try {
      await onDeleteDependency(depId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 py-4 border-b border-neutral-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Dependencies & Prerequisites
        </h3>

        {/* Add dependency button (PM / Owner role) */}
        {canManage && onAddDependency ? (
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add dependency</span>
          </button>
        ) : null}
      </div>

      {/* Conditional Blocked Warning Banner: ONLY rendered if card.isBlocked === true */}
      {card.isBlocked && (
        <div className="flex items-start gap-2.5 rounded-lg border border-error-200 bg-error-50 p-3 text-xs text-error-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-error-600 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-error-900">
              Blocked by an incomplete prerequisite
            </p>
            <p className="text-error-700 leading-relaxed">
              {card.blockReason ||
                'All prerequisite tasks must be completed before this card can be moved to "DONE".'}
            </p>
          </div>
        </div>
      )}

      {/* Dependencies List */}
      {dependencies.length > 0 ? (
        <div className="space-y-2">
          {dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-neutral-600 rounded bg-white px-1.5 py-0.5 border border-neutral-200">
                  {dep.prerequisiteCode}
                </span>
                <span className="font-medium text-neutral-800 line-clamp-1">
                  {dep.prerequisiteTitle}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {dep.isCompleted || dep.prerequisiteStatus === "DONE" ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    <Clock className="h-3 w-3" />
                    <span>In Progress</span>
                  </span>
                )}

                {/* Delete action for PM / Owner */}
                {canManage && onDeleteDependency && (
                  <button
                    type="button"
                    onClick={() => handleDelete(dep.id)}
                    disabled={deletingId === dep.id}
                    className="p-1 rounded text-neutral-400 hover:text-error-600 hover:bg-error-50 transition-colors"
                    aria-label={`Remove dependency ${dep.prerequisiteCode}`}
                    title="Remove dependency"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 italic">No dependencies configured.</p>
      )}

      {/* Prerequisite Selection Dialog */}
      {onAddDependency && (
        <AddDependencyDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          card={card}
          boardCards={boardCards}
          onAddDependency={onAddDependency}
        />
      )}
    </div>
  );
};
