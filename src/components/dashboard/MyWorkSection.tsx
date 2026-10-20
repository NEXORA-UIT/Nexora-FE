import * as React from "react";
import { ArrowRight, CalendarDays, ChevronDown, ChevronUp, CircleEqual, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { getBoardDetailRoute, ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import type { MyTaskItem } from "@/types";

type TaskFilter = "all" | "today" | "overdue";

interface MyWorkSectionProps {
  tasks: MyTaskItem[];
  isLoading: boolean;
  error: string | null;
  partialFailureCount: number;
  reload: () => Promise<void>;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function formatDueDate(value: string | null): string {
  if (!value) return "No due date";
  const dueDate = new Date(value);
  if (Number.isNaN(dueDate.getTime())) return "Due date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(dueDate);
}

export const MyWorkSection: React.FC<MyWorkSectionProps> = ({ tasks, isLoading, error, partialFailureCount, reload }) => {
  const [filter, setFilter] = React.useState<TaskFilter>("all");
  const today = startOfDay(new Date());
  const activeTasks = tasks.filter((task) => task.statusGroup !== "DONE");
  const overdueTasks = activeTasks.filter((task) => task.dueDate && startOfDay(new Date(task.dueDate)) < today);
  const dueTodayTasks = activeTasks.filter((task) => task.dueDate && startOfDay(new Date(task.dueDate)).getTime() === today.getTime());
  const filteredTasks = filter === "today" ? dueTodayTasks : filter === "overdue" ? overdueTasks : activeTasks;

  return (
    <section aria-labelledby="my-work-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">Your focus</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 id="my-work-heading" className="text-lg font-semibold text-slate-900">My Work</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{activeTasks.length} active</span>
          </div>
        </div>
        <div role="group" aria-label="Filter assigned tasks" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 text-xs">
          {(["all", "today", "overdue"] as TaskFilter[]).map((value) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-1.5 font-medium capitalize transition ${filter === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
              {value === "today" ? `Due today (${dueTodayTasks.length})` : value === "overdue" ? `Overdue (${overdueTasks.length})` : "All tasks"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div role="status" className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Loading your tasks…</div>
      ) : error ? (
        <div role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3 gap-2" onClick={() => void reload()}><RotateCw aria-hidden="true" className="h-3.5 w-3.5" />Try again</Button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-900">{activeTasks.length === 0 ? "No active tasks assigned to you" : filter === "today" ? "Nothing is due today" : filter === "overdue" ? "No overdue tasks" : "No tasks match this filter"}</p>
          <p className="mt-1 text-xs text-slate-500">Assigned cards from boards you can access will appear here.</p>
          <Link to={ROUTES.BOARDS} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800">Open boards <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {filteredTasks.slice(0, 7).map((task) => {
            const priorityIcon = task.priority === "URGENT" || task.priority === "HIGH" ? ChevronUp : task.priority === "LOW" ? ChevronDown : CircleEqual;
            const PriorityIcon = priorityIcon;
            return (
              <li key={task.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <Link to={getBoardDetailRoute(task.boardId)} className="min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <span className="block truncate text-sm font-semibold text-slate-800 hover:text-blue-700">{task.title}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">{task.workspaceName} · {task.boardName} · {task.code}</span>
                </Link>
                <div className="flex shrink-0 items-center gap-3 pl-0 text-xs text-slate-500 sm:pl-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${task.priority === "URGENT" || task.priority === "HIGH" ? "bg-rose-50 text-rose-700" : task.priority === "MEDIUM" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}><PriorityIcon aria-hidden="true" className="h-3.5 w-3.5" />{task.priority.toLocaleLowerCase()}</span>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />{formatDueDate(task.dueDate)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {partialFailureCount > 0 && !error && <p role="status" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Some boards could not be checked. Refresh to retry.</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Link to={ROUTES.MY_TASKS} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800">View all tasks <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
        {tasks.length > 7 && <span className="text-xs text-slate-500">Showing 7 of {tasks.length} assigned tasks</span>}
      </div>
    </section>
  );
};
