import * as React from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  ArrowRight,
  ChevronUp,
  Equal,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { HomeTaskItem, HomeTaskFilter } from "@/types";

const INITIAL_TASKS: HomeTaskItem[] = [
  {
    id: "task-1",
    title: "Review authentication flow",
    projectSubtitle: "Core Platform • Website Redesign",
    priority: "high",
    dueText: "Today • 4:00 PM",
    isToday: true,
    isOverdue: false,
    completed: false,
    assigneeInitials: "Đ",
  },
  {
    id: "task-2",
    title: "Prepare sprint documentation",
    projectSubtitle: "Core Platform • System Architecture",
    priority: "medium",
    dueText: "Today • 5:30 PM",
    isToday: true,
    isOverdue: false,
    completed: false,
    assigneeInitials: "Đ",
  },
  {
    id: "task-3",
    title: "Audit color tokens against WCAG contrast",
    projectSubtitle: "Core Platform • Website Redesign",
    priority: "medium",
    dueText: "Today • End of day",
    isToday: true,
    isOverdue: false,
    completed: false,
    assigneeInitials: "Đ",
  },
  {
    id: "task-4",
    title: "Validate API integration & OAuth rotation schema",
    projectSubtitle: "Core Platform • Mobile Application",
    priority: "high",
    dueText: "Tomorrow • 2:00 PM",
    isToday: false,
    isOverdue: false,
    completed: false,
    assigneeInitials: "Đ",
  },
  {
    id: "task-5",
    title: "Update Tailwind config with #2563EB primary tokens",
    projectSubtitle: "Core Platform • Website Redesign",
    priority: "low",
    dueText: "Oct 14",
    isToday: false,
    isOverdue: false,
    completed: false,
    assigneeInitials: "Đ",
  },
  {
    id: "task-6",
    title: "Submit SRS document review for milestone sign-off",
    projectSubtitle: "Core Platform • System Architecture",
    priority: "medium",
    dueText: "Oct 15",
    isToday: false,
    isOverdue: true,
    completed: false,
    assigneeInitials: "Đ",
  },
];

export const MyWorkSection: React.FC = () => {
  const [filter, setFilter] = React.useState<HomeTaskFilter>("all");
  const [tasks, setTasks] = React.useState<HomeTaskItem[]>(INITIAL_TASKS);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const filteredTasks = React.useMemo(() => {
    switch (filter) {
      case "today":
        return tasks.filter((t) => t.isToday);
      case "upcoming":
        return tasks.filter((t) => !t.isToday && !t.isOverdue);
      case "overdue":
        return tasks.filter((t) => t.isOverdue);
      default:
        return tasks;
    }
  }, [filter, tasks]);

  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs sm:p-6">
      {/* Header: Title & Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-neutral-900">My Work</h2>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
            {tasks.filter((t) => !t.completed).length} active
          </span>
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex items-center rounded-xl bg-neutral-100 p-1 text-xs select-none">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-all",
              filter === "all"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            All (6)
          </button>
          <button
            type="button"
            onClick={() => setFilter("today")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-all",
              filter === "today"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            Today (3)
          </button>
          <button
            type="button"
            onClick={() => setFilter("upcoming")}
            className={cn(
              "rounded-lg px-2.5 py-1 font-medium transition-all",
              filter === "upcoming"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            Upcoming (2)
          </button>
          <button
            type="button"
            onClick={() => setFilter("overdue")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all",
              filter === "overdue"
                ? "bg-white text-neutral-900 font-semibold shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-error-500" />
            <span>Overdue (1)</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="mt-4 divide-y divide-neutral-100">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-3 py-3 hover:bg-neutral-50/60 px-2 rounded-lg transition-colors group"
          >
            {/* Left: Checkbox + Title & Project Subtitle */}
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                aria-label={`Mark "${task.title}" as complete`}
              />
              <div className="min-w-0">
                <span
                  className={cn(
                    "block text-xs font-semibold text-neutral-800 truncate transition-colors",
                    task.completed && "line-through text-neutral-400"
                  )}
                >
                  {task.title}
                </span>
                <span className="block text-[11px] text-neutral-400 truncate">
                  {task.projectSubtitle}
                </span>
              </div>
            </div>

            {/* Right: Priority Badge, Due Date & Assignee Avatar */}
            <div className="flex items-center gap-2.5 shrink-0 select-none">
              {/* Priority Chip */}
              {task.priority === "high" && (
                <span className="flex items-center gap-0.5 rounded border border-error-200 bg-error-50 px-1.5 py-0.5 text-[10px] font-bold text-error-600">
                  <ChevronUp className="h-3 w-3 stroke-[3]" />
                  <span>High</span>
                </span>
              )}
              {task.priority === "medium" && (
                <span className="flex items-center gap-0.5 rounded border border-warning-200 bg-warning-50 px-1.5 py-0.5 text-[10px] font-bold text-warning-700">
                  <Equal className="h-3 w-3 stroke-[3]" />
                  <span>Medium</span>
                </span>
              )}
              {task.priority === "low" && (
                <span className="flex items-center gap-0.5 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-600">
                  <ChevronDown className="h-3 w-3 stroke-[3]" />
                  <span>Low</span>
                </span>
              )}

              {/* Due Timestamp */}
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                {task.dueText.includes("Today") ? (
                  <Clock className="h-3 w-3 text-neutral-400" />
                ) : (
                  <Calendar className="h-3 w-3 text-neutral-400" />
                )}
                <span>{task.dueText}</span>
              </div>

              {/* Assignee Avatar Circle */}
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6366F1] text-[10px] font-bold text-white shadow-2xs">
                {task.assigneeInitials}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Footer: Links & Keyboard Hint */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs select-none">
        <Link
          to={ROUTES.UNDER_DEVELOPMENT}
          className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
        >
          <span>View all tasks (6)</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        <span className="text-[11px] text-neutral-400">
          Press <kbd className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600">N</kbd> to add new task
        </span>
      </div>
    </div>
  );
};
