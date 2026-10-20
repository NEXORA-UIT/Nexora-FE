import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Archive,
  LayoutGrid,
  Plus,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceMembership } from "@/hooks";
import { getBoardDetailRoute } from "@/constants/routes";
import type { Board, Workspace } from "@/types";

interface WorkspaceOverviewPanelProps {
  workspace: Workspace;
  boards: Board[];
  onCreateBoardClick: () => void;
}

function formatUpdatedAt(value: string): string {
  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(updatedAt);
}

export const WorkspaceOverviewPanel: React.FC<WorkspaceOverviewPanelProps> = ({
  workspace,
  boards,
  onCreateBoardClick,
}) => {
  const membership = useWorkspaceMembership(workspace.id);
  const activeBoards = React.useMemo(
    () => boards.filter((board) => board.status === "active"),
    [boards]
  );
  const archivedBoardCount = boards.filter((board) => board.status === "archived").length;
  const recentBoards = React.useMemo(
    () =>
      [...activeBoards]
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        )
        .slice(0, 3),
    [activeBoards]
  );

  const metrics = [
    {
      label: "Active boards",
      value: activeBoards.length,
      icon: LayoutGrid,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Archived boards",
      value: archivedBoardCount,
      icon: Archive,
      tone: "bg-slate-100 text-slate-700",
    },
    {
      label: "Members",
      value: membership.members.length,
      icon: Users,
      tone: "bg-cyan-50 text-cyan-700",
    },
  ];

  return (
    <section aria-labelledby="workspace-overview-heading" className="space-y-6 pt-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-[#2563EB] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10 bg-white/5"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-24 h-64 w-64 rounded-full border border-white/10"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
              {workspace.teamType || "Workspace"}
            </div>
            <h2
              id="workspace-overview-heading"
              className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              {workspace.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
              {workspace.description || "Your team's shared space for planning and delivery."}
            </p>
          </div>
          <Button
            type="button"
            onClick={onCreateBoardClick}
            disabled={workspace.status === "archived" || workspace.isFrozen}
            className="relative h-10 shrink-0 gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-50 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create board
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.02]"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section
          aria-labelledby="recent-boards-heading"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                Project spaces
              </p>
              <h3 id="recent-boards-heading" className="mt-1 text-lg font-semibold text-slate-900">
                Recent boards
              </h3>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {activeBoards.length} active
            </span>
          </div>

          {recentBoards.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <LayoutGrid aria-hidden="true" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                No boards in this workspace yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create a board to plan work with your team.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={onCreateBoardClick}
                disabled={workspace.status === "archived" || workspace.isFrozen}
                className="mt-4"
              >
                <Plus className="h-4 w-4" />
                Create board
              </Button>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {recentBoards.map((board) => (
                <Link
                  key={board.id}
                  to={getBoardDetailRoute(board.id)}
                  className="group flex items-center gap-3 py-3.5 outline-none first:pt-1 last:pb-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-blue-100/80">
                    <LayoutGrid aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                      {board.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {board.openTasksCount !== undefined && (
                        <span>{board.openTasksCount} open tasks</span>
                      )}
                      {board.completedPercent !== undefined && (
                        <span>{board.completedPercent}% complete</span>
                      )}
                      <span>Updated {formatUpdatedAt(board.updatedAt)}</span>
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-700"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="workspace-team-heading"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
              <UsersRound aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h3 id="workspace-team-heading" className="text-sm font-semibold text-slate-900">
                Your team
              </h3>
              <p className="text-xs text-slate-500">
                {membership.members.length} workspace members
              </p>
            </div>
          </div>

          {membership.isLoading ? (
            <div role="status" className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading members…
            </div>
          ) : membership.error ? (
            <div role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
              <p>{membership.error}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => void membership.refresh()}
              >
                Try again
              </Button>
            </div>
          ) : membership.members.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No workspace members are available yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-1">
              {membership.members.slice(0, 5).map((member) => {
                const name = member.user.fullName || member.user.email;
                const initials = name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toLocaleUpperCase();

                return (
                  <li key={member.userId} className="flex items-center gap-3 rounded-xl px-2 py-2">
                    <span
                      aria-label={`Avatar for ${name}`}
                      role="img"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700 ring-1 ring-white"
                    >
                      {initials || "?"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">{name}</span>
                      <span className="block text-xs text-slate-500">
                        {member.role === "OWNER" ? "Workspace owner" : "Member"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {!membership.isLoading && !membership.error && membership.members.length > 0 && (
            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
              {membership.members.length > 5
                ? `Showing 5 of ${membership.members.length} members.`
                : "Manage invitations and roles from the Members tab."}
            </p>
          )}
        </section>
      </div>
    </section>
  );
};
