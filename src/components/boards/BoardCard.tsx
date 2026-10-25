import * as React from "react";
import { ArrowUpRight, Clock3, LayoutGrid, UsersRound } from "lucide-react";
import { BoardActionMenu } from "./BoardActionMenu";
import type { BoardCardProps } from "@/types";

function formatUpdatedAt(value: string): string {
  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: updatedAt.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(updatedAt);
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onArchive, onDelete, onClick }) => {
  const members = board.members ?? [];
  const maxVisible = board.maxVisibleAvatars ?? 3;
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = Math.max(0, members.length - maxVisible);
  const hasStats = board.openTasksCount !== undefined || board.completedPercent !== undefined;
  const coverStyle = board.coverColor ? { backgroundColor: board.coverColor } : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(board)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.(board);
        }
      }}
      className="shadow-xs focus-visible:outline-hidden group relative flex min-h-72 cursor-pointer select-none flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div
        data-testid="board-card-cover"
        className={`relative h-28 overflow-hidden ${board.coverColor ? "" : "bg-primary-100"}`}
        style={coverStyle}
      >
        {board.coverUrl ? (
          <img
            src={board.coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute -right-7 -top-12 h-36 w-36 rounded-full border border-white/40" />
            <div className="absolute -right-1 -top-6 h-24 w-24 rounded-full border border-white/40" />
            <div className="absolute bottom-0 left-0 h-1 w-full bg-primary-500" />
          </>
        )}
        <div className="text-primary-700 absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="absolute right-2 top-2 rounded-lg border border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
          <BoardActionMenu board={board} onArchive={onArchive} onDelete={onDelete} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="group-hover:text-primary-600 truncate text-sm font-bold text-neutral-900 transition-colors">
              {board.name}
            </h3>
            {board.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
                {board.description}
              </p>
            )}
          </div>
          <ArrowUpRight
            className="group-hover:text-primary-600 mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-colors"
            aria-hidden="true"
          />
        </div>

        {hasStats && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              {board.openTasksCount !== undefined && (
                <span className="font-medium text-neutral-600">
                  {board.openTasksCount} open tasks
                </span>
              )}
              {board.completedPercent !== undefined && (
                <span className="font-semibold text-neutral-700">
                  {board.completedPercent}% complete
                </span>
              )}
            </div>
            {board.completedPercent !== undefined && (
              <div
                className="h-1.5 overflow-hidden rounded-full bg-neutral-100"
                aria-label={`${board.completedPercent}% complete`}
              >
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, board.completedPercent))}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
          <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] text-neutral-500">
            <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Updated {formatUpdatedAt(board.updatedAt)}
          </span>
          {members.length > 0 && (
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-neutral-600">
              <span className="flex items-center -space-x-1.5">
                {visibleMembers.map((member) => (
                  <span
                    key={member.id}
                    title={member.name}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-[9px] font-semibold text-neutral-700"
                  >
                    {member.initials}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="text-primary-700 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-primary-50 px-1 text-[9px] font-semibold">
                    +{remainingCount}
                  </span>
                )}
              </span>
              <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
              {members.length} {members.length === 1 ? "member" : "members"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
