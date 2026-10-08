import * as React from "react";
import { Link2, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import type { KanbanCard } from "@/types";

export interface PlanningDependencyOverviewProps {
  cards: KanbanCard[];
  onCardClick: (cardId: string) => void;
}

interface FlattenedDependency {
  cardId: string;
  cardCode: string;
  cardTitle: string;
  isBlocked?: boolean;
  depId: string;
  prerequisiteId: string;
  prerequisiteCode: string;
  prerequisiteTitle: string;
  prerequisiteStatus: string;
  isCompleted: boolean;
}

export const PlanningDependencyOverview: React.FC<PlanningDependencyOverviewProps> = ({
  cards,
  onCardClick,
}) => {
  const flattenedDependencies = React.useMemo<FlattenedDependency[]>(() => {
    const list: FlattenedDependency[] = [];
    for (const card of cards) {
      if (card.dependencies && card.dependencies.length > 0) {
        for (const dep of card.dependencies) {
          list.push({
            cardId: card.id,
            cardCode: card.code,
            cardTitle: card.title,
            isBlocked: card.isBlocked,
            depId: dep.id,
            prerequisiteId: dep.prerequisiteCardId,
            prerequisiteCode: dep.prerequisiteCode,
            prerequisiteTitle: dep.prerequisiteTitle,
            prerequisiteStatus: dep.prerequisiteStatus,
            isCompleted: dep.isCompleted || dep.prerequisiteStatus === "DONE",
          });
        }
      }
    }
    return list;
  }, [cards]);

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs select-none space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Dependency Relations ({flattenedDependencies.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Overview of all prerequisite links defined on this board.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {flattenedDependencies.length === 0 ? (
        <p className="py-8 text-center text-xs text-neutral-400 italic">
          No dependencies defined across board cards yet.
        </p>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 pr-4">Dependent Card</th>
                  <th className="py-2.5 px-4">Prerequisite Card</th>
                  <th className="py-2.5 px-4">Prerequisite Status</th>
                  <th className="py-2.5 pl-4 text-right">Blocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {flattenedDependencies.map((item) => (
                  <tr key={`${item.cardId}-${item.depId}`} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Dependent Card */}
                    <td className="py-2.5 pr-4">
                      <button
                        type="button"
                        onClick={() => onCardClick(item.cardId)}
                        className="flex items-center gap-2 text-left group"
                      >
                        <span className="font-mono text-[11px] font-semibold text-neutral-600 rounded bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 group-hover:border-primary-400 group-hover:text-primary-700 transition-colors">
                          {item.cardCode}
                        </span>
                        <span className="font-medium text-neutral-900 group-hover:text-primary-700 transition-colors truncate max-w-[160px] lg:max-w-xs">
                          {item.cardTitle}
                        </span>
                      </button>
                    </td>

                    {/* Prerequisite Card */}
                    <td className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={() => onCardClick(item.prerequisiteId)}
                        className="flex items-center gap-2 text-left group"
                      >
                        <span className="font-mono text-[11px] font-semibold text-neutral-600 rounded bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 group-hover:border-primary-400 group-hover:text-primary-700 transition-colors">
                          {item.prerequisiteCode}
                        </span>
                        <span className="font-medium text-neutral-800 group-hover:text-primary-700 transition-colors truncate max-w-[160px] lg:max-w-xs">
                          {item.prerequisiteTitle}
                        </span>
                      </button>
                    </td>

                    {/* Prereq Status */}
                    <td className="py-2.5 px-4">
                      {item.isCompleted ? (
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
                    </td>

                    {/* Blocked State */}
                    <td className="py-2.5 pl-4 text-right">
                      {item.isBlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-error-200 bg-error-50 px-2 py-0.5 text-[11px] font-semibold text-error-700">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-neutral-400">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (<640px) */}
          <div className="sm:hidden space-y-2">
            {flattenedDependencies.map((item) => (
              <div
                key={`m-${item.cardId}-${item.depId}`}
                className="p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 space-y-2 text-xs"
              >
                {/* Dependent Card Link */}
                <button
                  type="button"
                  onClick={() => onCardClick(item.cardId)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span className="font-mono text-[11px] font-semibold text-neutral-600 rounded bg-white px-1.5 py-0.5 border border-neutral-200">
                      {item.cardCode}
                    </span>
                    <span className="font-medium text-neutral-900 group-hover:text-primary-700 truncate">
                      {item.cardTitle}
                    </span>
                  </div>
                  {item.isBlocked && (
                    <span className="shrink-0 text-[10px] font-semibold text-error-700 bg-error-50 border border-error-200 rounded px-1.5 py-0.5">
                      Blocked
                    </span>
                  )}
                </button>

                {/* Prerequisite Card Arrow */}
                <div className="flex items-center gap-2 pl-3 text-neutral-500">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => onCardClick(item.prerequisiteId)}
                    className="flex items-center gap-1.5 text-left group min-w-0"
                  >
                    <span className="font-mono text-[11px] font-semibold text-neutral-600 rounded bg-white px-1.5 py-0.5 border border-neutral-200">
                      {item.prerequisiteCode}
                    </span>
                    <span className="font-medium text-neutral-700 group-hover:text-primary-700 truncate">
                      {item.prerequisiteTitle}
                    </span>
                  </button>
                  <span className="shrink-0 ml-auto text-[10px] text-neutral-400">
                    {item.isCompleted ? "Done" : "In Progress"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
