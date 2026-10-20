import * as React from "react";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES, getBoardDetailRoute } from "@/constants/routes";
import type { MyTaskItem } from "@/types";

interface UpcomingSectionProps {
  tasks: MyTaskItem[];
  isLoading: boolean;
  error: string | null;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function formatDueDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

export const UpcomingSection: React.FC<UpcomingSectionProps> = ({ tasks, isLoading, error }) => {
  const today = startOfDay(new Date());
  const upcomingTasks = tasks
    .filter((task) => task.statusGroup !== "DONE" && task.dueDate && startOfDay(new Date(task.dueDate)) >= today)
    .sort((left, right) => (left.dueDate ?? "").localeCompare(right.dueDate ?? ""))
    .slice(0, 4);

  return (
    <section aria-labelledby="upcoming-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800"><CalendarDays aria-hidden="true" className="h-4 w-4" /></span>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Due dates</p><h2 id="upcoming-heading" className="text-sm font-semibold text-slate-900">Coming up</h2></div>
        </div>
        <Link to={ROUTES.CALENDAR} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800">Calendar <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
      </div>
      {isLoading ? (
        <p role="status" className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Loading due dates…</p>
      ) : error ? (
        <p role="status" className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Could not load due dates.</p>
      ) : upcomingTasks.length === 0 ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No upcoming due dates on your assigned cards.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {upcomingTasks.map((task) => (
            <li key={task.id}>
              <Link to={getBoardDetailRoute(task.boardId)} className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  <span className="mt-0.5 text-[9px] font-bold">{new Date(task.dueDate!).getDate()}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800">{task.title}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">{formatDueDate(task.dueDate!)} · {task.boardName}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
