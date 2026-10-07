import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import type { KanbanCard } from "@/types";

export interface CardDetailDependenciesProps {
  card: KanbanCard;
}

export const CardDetailDependencies: React.FC<CardDetailDependenciesProps> = ({ card }) => {
  const dependencies = card.dependencies || [];

  return (
    <div className="space-y-3 py-4 border-b border-neutral-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Dependencies & Prerequisites
        </h3>

        {/* Read-only + Add dependency indicator */}
        <span
          className="inline-flex cursor-not-allowed items-center gap-1 text-[11px] font-medium text-neutral-400"
          title="Dependency management is coming in a future release."
        >
          <span>+ Add dependency</span>
          <HelpCircle className="h-2.5 w-2.5" />
        </span>
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

              <div>
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 italic">No dependencies configured.</p>
      )}
    </div>
  );
};
