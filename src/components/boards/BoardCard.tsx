import * as React from "react";
import { BoardActionMenu } from "./BoardActionMenu";
import type { BoardCardProps } from "@/types";

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onArchive,
  onClick,
}) => {
  const maxVisible = board.maxVisibleAvatars ?? 3;
  const visibleMembers = board.members.slice(0, maxVisible);
  const remainingCount = Math.max(0, board.members.length - maxVisible);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(board)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(board);
        }
      }}
      className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer select-none overflow-hidden"
    >
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600" />

      {/* Top Row: Title, Action Menu */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
            {board.title}
          </h3>
          <BoardActionMenu board={board} onArchive={onArchive} />
        </div>

        {/* Description */}
        <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
          {board.description}
        </p>
      </div>

      {/* Middle & Bottom: Tasks, Progress Bar, Avatars */}
      <div className="mt-5 space-y-4">
        {/* Task Metric Row & Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-600">
              {board.openTasksCount} open tasks
            </span>
            <span className="font-semibold text-neutral-800">
              {board.completedPercent}% complete
            </span>
          </div>

          {/* Progress Bar Track & Fill */}
          <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, board.completedPercent))}%` }}
            />
          </div>
        </div>

        {/* Member Avatar Stack */}
        <div className="flex items-center -space-x-1.5">
          {visibleMembers.map((member) => (
            <div
              key={member.id}
              title={member.name}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-[10px] font-semibold text-neutral-700 shadow-2xs"
            >
              {member.initials}
            </div>
          ))}

          {remainingCount > 0 && (
            <div
              title={`${remainingCount} more members`}
              className="flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-primary-50 px-1 text-[10px] font-semibold text-primary-700 shadow-2xs"
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
