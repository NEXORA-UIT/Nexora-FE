import * as React from "react";
import { Link } from "react-router-dom";
import { format, isBefore, parseISO, startOfDay, addDays } from "date-fns";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, RefreshCw, TrendingUp } from "lucide-react";
import { CardPriorityBadge } from "@/components/kanban/CardPriorityBadge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMyTasks } from "@/hooks";
import { getBoardDetailRoute } from "@/constants/routes";
import type { MyTaskItem } from "@/types";

type TaskDateFilter = "ALL" | "OVERDUE" | "TODAY" | "UPCOMING" | "UNSCHEDULED";
type TaskStatusFilter = MyTaskItem["statusGroup"];

function isTaskInDateFilter(task: MyTaskItem, filter: TaskDateFilter, today: Date): boolean {
  if (filter === "ALL") return true;
  if (filter === "UNSCHEDULED") return !task.dueDate;
  if (!task.dueDate) return false;
  const dueDate = parseISO(task.dueDate);
  if (filter === "OVERDUE") return isBefore(dueDate, today);
  if (filter === "TODAY") return dueDate >= today && dueDate < addDays(today, 1);
  return dueDate >= addDays(today, 1);
}

export const MyTasksPage: React.FC = () => {
  const { tasks, isLoading, error, partialFailureCount, reload } = useMyTasks();
  const [statusFilter, setStatusFilter] = React.useState<TaskStatusFilter>("TODO");
  const [dateFilter, setDateFilter] = React.useState<TaskDateFilter>("ALL");
  const [search, setSearch] = React.useState("");
  const today = startOfDay(new Date());
  const filteredTasks = tasks.filter((task) => {
    const query = search.trim().toLowerCase();
    const matchesQuery =
      !query ||
      `${task.code} ${task.title} ${task.boardName} ${task.workspaceName}`
        .toLowerCase()
        .includes(query);
    return (
      matchesQuery &&
      task.statusGroup === statusFilter &&
      isTaskInDateFilter(task, dateFilter, today)
    );
  });
  const statusTabs: Array<{ value: TaskStatusFilter; label: string }> = [
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
  ];
  const openCount = tasks.filter((task) => task.statusGroup !== "DONE").length;
  const overdueCount = tasks.filter((task) => isTaskInDateFilter(task, "OVERDUE", today) && task.statusGroup !== "DONE").length;
  const dueTodayCount = tasks.filter((task) => isTaskInDateFilter(task, "TODAY", today) && task.statusGroup !== "DONE").length;

  return (
    <main className="space-y-7">
      <PageHeader
        title="My tasks"
        description="Active cards assigned to you across Boards you can access."
        eyebrow="Personal planning"
        actions={<Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void reload()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </Button>}
      />

      <section aria-label="Task summary" className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open tasks", count: openCount, icon: CheckCircle2, tone: "bg-blue-50 text-blue-700" },
          { label: "Due today", count: dueTodayCount, icon: Clock3, tone: "bg-amber-50 text-amber-800" },
          { label: "Overdue", count: overdueCount, icon: TrendingUp, tone: "bg-rose-50 text-rose-700" },
        ].map(({ label, count, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>
            <div><p className="text-xl font-semibold text-slate-900">{count}</p><p className="text-xs font-medium text-slate-500">{label}</p></div>
          </div>
        ))}
      </section>

      <div
        role="tablist"
        aria-label="Task status"
        className="flex gap-1 overflow-x-auto border-b border-slate-200"
      >
        {statusTabs.map(({ value, label }) => {
          const count = tasks.filter((task) => task.statusGroup === value).length;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={statusFilter === value}
              onClick={() => setStatusFilter(value)}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${statusFilter === value ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {label}
              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="min-w-48 flex-1 space-y-1 text-xs font-medium text-neutral-700">
          <span>Search tasks</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Title, Card code, Board, or Workspace"
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </label>
        <label className="w-full space-y-1 text-xs font-medium text-neutral-700 sm:w-48">
          <span>Filter by due date</span>
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as TaskDateFilter)}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">Any date</option>
            <option value="OVERDUE">Overdue</option>
            <option value="TODAY">Due today</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="UNSCHEDULED">No due date</option>
          </select>
        </label>
      </div>

      {partialFailureCount > 0 && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Some workspaces or Boards could not be loaded ({partialFailureCount}). This list may be incomplete.
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="border-error-200 text-error-700 flex items-center justify-between gap-3 rounded-lg border bg-error-50 px-4 py-3 text-sm"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void reload()}>
            Try again
          </Button>
        </div>
      )}
      {isLoading ? (
        <div
          role="status"
          className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500"
        >
            Loading tasks…
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-neutral-400" />
          <h2 className="mt-3 text-sm font-semibold text-neutral-900">
            No matching tasks
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Try changing the filters or check Card assignments.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {filteredTasks.map((task) => (
            <article
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-medium text-neutral-500">{task.code}</p>
                <Link
                  to={getBoardDetailRoute(task.boardId)}
                  className="hover:text-primary-700 mt-0.5 block truncate text-sm font-semibold text-neutral-900"
                >
                  {task.title}
                </Link>
                <p className="mt-1 text-xs text-neutral-500">
                  {task.workspaceName} · {task.boardName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CardPriorityBadge priority={task.priority} />
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                  {task.statusGroup.replace("_", " ")}
                </span>
                <span className="flex min-w-24 items-center justify-end gap-1.5 text-xs text-neutral-500">
                  {task.dueDate ? (
                    <>
                      <CalendarDays className="h-3.5 w-3.5" />
                      {format(parseISO(task.dueDate), "MMM d, yyyy")}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      No due date
                    </>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};
