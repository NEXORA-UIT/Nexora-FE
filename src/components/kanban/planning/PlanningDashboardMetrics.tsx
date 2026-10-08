import * as React from "react";
import { CheckCircle2, Layers, Clock, AlertTriangle } from "lucide-react";
import type { BoardDashboard } from "@/types";

export interface PlanningDashboardMetricsProps {
  metrics: BoardDashboard;
  isLoading?: boolean;
}

export const PlanningDashboardMetrics: React.FC<PlanningDashboardMetricsProps> = ({
  metrics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            data-testid="metric-skeleton"
            className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs animate-pulse space-y-3"
          >
            <div className="h-4 w-24 bg-neutral-200 rounded" />
            <div className="h-7 w-16 bg-neutral-200 rounded" />
            <div className="h-3 w-32 bg-neutral-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const rate = Math.min(100, Math.max(0, metrics.completionRate || 0));
  const hasCards = metrics.totalCards > 0;
  const isOverdueRisk = metrics.overdueCards > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 select-none">
      {/* 1. Completion Rate & Progress */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <span>Completion Rate</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-neutral-900">
            {hasCards ? `${metrics.completionRate}%` : "0%"}
          </div>
          <div className="mt-2 w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          {metrics.completedCards} of {metrics.totalCards} cards completed
        </p>
      </div>

      {/* 2. Total Cards */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <span>Total Cards</span>
          <Layers className="h-4 w-4 text-primary-600" />
        </div>
        <div className="my-2">
          <div className="text-2xl font-bold tracking-tight text-neutral-900">
            {metrics.totalCards}
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          {hasCards ? "All active cards across lists" : "No cards in this board yet"}
        </p>
      </div>

      {/* 3. Active Workload Breakdown (In Progress & To Do) */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          <span>Active Workload</span>
          <Clock className="h-4 w-4 text-amber-600" />
        </div>
        <div className="my-2 flex items-baseline gap-4">
          <div>
            <span className="text-2xl font-bold tracking-tight text-amber-600">
              {metrics.inProgressCards}
            </span>
            <span className="ml-1 text-xs font-medium text-neutral-500">In Progress</span>
          </div>
          <div className="text-neutral-300">/</div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-neutral-700">
              {metrics.todoCards}
            </span>
            <span className="ml-1 text-xs font-medium text-neutral-500">To Do</span>
          </div>
        </div>
        <p className="text-xs text-neutral-500">
          Work currently in active pipeline
        </p>
      </div>

      {/* 4. Overdue Cards */}
      <div
        className={`rounded-xl border p-4 shadow-2xs flex flex-col justify-between transition-colors ${
          isOverdueRisk
            ? "border-error-200 bg-error-50/40"
            : "border-neutral-200/80 bg-white"
        }`}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
          <span className={isOverdueRisk ? "text-error-700" : "text-neutral-500"}>
            Overdue
          </span>
          <AlertTriangle
            className={`h-4 w-4 ${isOverdueRisk ? "text-error-600" : "text-neutral-400"}`}
          />
        </div>
        <div className="my-2">
          <div
            className={`text-2xl font-bold tracking-tight ${
              isOverdueRisk ? "text-error-700" : "text-neutral-900"
            }`}
          >
            {metrics.overdueCards}
          </div>
        </div>
        <p className={`text-xs ${isOverdueRisk ? "text-error-600 font-medium" : "text-neutral-500"}`}>
          {isOverdueRisk ? "Cards requiring immediate attention" : "All cards on track"}
        </p>
      </div>
    </div>
  );
};
