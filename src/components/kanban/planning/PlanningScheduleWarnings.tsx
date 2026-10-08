import * as React from "react";
import { AlertTriangle, AlertCircle, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import type { ScheduleWarning, ScheduleWarningType } from "@/types";

export interface PlanningScheduleWarningsProps {
  warnings: ScheduleWarning[];
  onCardClick: (cardId: string) => void;
}

export const PlanningScheduleWarnings: React.FC<PlanningScheduleWarningsProps> = ({
  warnings,
  onCardClick,
}) => {
  const [activeTab, setActiveTab] = React.useState<"ALL" | ScheduleWarningType>("ALL");

  const overdueCount = warnings.filter((w) => w.type === "OVERDUE").length;
  const blockersCount = warnings.filter((w) => w.type === "BLOCKER").length;
  const conflictsCount = warnings.filter((w) => w.type === "CONFLICT").length;

  const filteredWarnings = warnings.filter((w) => {
    if (activeTab === "ALL") return true;
    return w.type === activeTab;
  });

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs select-none space-y-4">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Schedule & Blocker Warnings
          </h3>
          <p className="text-xs text-neutral-500">
            Automated alerts for deadlines, blocked dependencies, and schedule conflicts.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 border border-neutral-200/60 self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "ALL"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            All ({warnings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("BLOCKER")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "BLOCKER"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Blockers ({blockersCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("OVERDUE")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "OVERDUE"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CONFLICT")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === "CONFLICT"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Date Conflicts ({conflictsCount})
          </button>
        </div>
      </div>

      {/* Warnings List or Empty State */}
      {warnings.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-900">All scheduled cards are on track</p>
            <p className="text-emerald-700">No blockers or date conflicts detected across the board.</p>
          </div>
        </div>
      ) : filteredWarnings.length === 0 ? (
        <p className="py-6 text-center text-xs text-neutral-400 italic">
          No warnings in this category.
        </p>
      ) : (
        <div className="space-y-2">
          {filteredWarnings.map((warning) => {
            const isOverdue = warning.type === "OVERDUE";
            const isBlocker = warning.type === "BLOCKER";

            return (
              <button
                key={warning.id}
                type="button"
                onClick={() => onCardClick(warning.cardId)}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-100/60 hover:border-neutral-300 text-left transition-all group"
              >
                <div className="flex items-start gap-3 min-w-0 pr-3">
                  <div className="mt-0.5 shrink-0">
                    {isOverdue ? (
                      <AlertCircle className="h-4 w-4 text-error-600" />
                    ) : isBlocker ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-purple-600" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-semibold text-neutral-600 rounded bg-white px-1.5 py-0.5 border border-neutral-200">
                        {warning.cardCode}
                      </span>
                      <span className="text-xs font-semibold text-neutral-900 truncate">
                        {warning.cardTitle}
                      </span>

                      {/* Warning Type Badge */}
                      {isOverdue && (
                        <span className="text-[10px] font-semibold text-error-700 bg-error-50 border border-error-200 rounded px-1.5 py-0.5">
                          Overdue
                        </span>
                      )}
                      {isBlocker && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                          Blocked
                        </span>
                      )}
                      {warning.type === "CONFLICT" && (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5">
                          Date Conflict
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-1">
                      {warning.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center text-neutral-400 group-hover:text-neutral-700 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
