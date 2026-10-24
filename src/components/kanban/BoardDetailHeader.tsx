import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, UserPlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { BoardDetail } from "@/types";

export interface BoardDetailHeaderProps {
  board: BoardDetail;
  realtimeConnected?: boolean;
  workspaceName?: string;
  onShareClick?: () => void;
  onOptionsClick?: () => void;
}

export const BoardDetailHeader: React.FC<BoardDetailHeaderProps> = ({
  board,
  realtimeConnected,
  workspaceName = "Workspace",
  onShareClick,
  onOptionsClick,
}) => {
  const members = board.members || [];
  const visibleMembers = members.slice(0, 4);
  const remainingCount = Math.max(0, members.length - 4);

  return (
    <div className="select-none space-y-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/80 p-4 shadow-sm sm:p-5">
      {/* 1. Breadcrumb Hierarchy */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link
          to={ROUTES.BOARDS}
          className="font-medium text-neutral-500 transition-colors hover:text-neutral-900"
        >
          {workspaceName}
        </Link>
        <ChevronRight className="h-3 w-3 text-neutral-400" />
        <span className="font-semibold text-neutral-900">{board.name}</span>
      </nav>

      {/* 2. Title, Description, and Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Board Title & Active Badge */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{board.name}</h1>

            {board.status === "ACTIVE" && (
              <span className="text-primary-700 inline-flex items-center gap-1.5 rounded-full border border-primary-200/60 bg-primary-50 px-2.5 py-0.5 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                Active
              </span>
            )}
            {realtimeConnected !== undefined && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${realtimeConnected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                role="status"
                aria-label={
                  realtimeConnected ? "Live updates connected" : "Reconnecting live updates"
                }
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${realtimeConnected ? "bg-emerald-600" : "bg-amber-500"}`}
                />
                {realtimeConnected ? "Live" : "Reconnecting"}
              </span>
            )}
          </div>

          {board.description && (
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-500">
              {board.description}
            </p>
          )}
        </div>

        {/* Right: Members Stack, Share Button, and Options */}
        <div className="flex shrink-0 items-center gap-2.5 self-start sm:self-auto">
          {/* Avatar stack */}
          <div className="flex items-center -space-x-2">
            {visibleMembers.map((member) => (
              <div
                key={member.id}
                title={member.name}
                aria-label={member.name}
                className="shadow-2xs flex h-7 w-7 cursor-default items-center justify-center rounded-full border-2 border-white bg-primary-600 text-[11px] font-bold text-white transition-transform hover:z-10 hover:scale-110"
              >
                {member.initials}
              </div>
            ))}

            {remainingCount > 0 && (
              <div
                title={`${remainingCount} more members`}
                aria-label={`${remainingCount} more members`}
                className="shadow-2xs flex h-7 min-w-7 cursor-default items-center justify-center rounded-full border-2 border-white bg-neutral-100 px-1 text-[11px] font-semibold text-neutral-700 hover:z-10"
              >
                +{remainingCount}
              </div>
            )}
          </div>

          {/* Share / Members Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onShareClick}
            className="h-8 gap-1.5 rounded-lg border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <UserPlus className="h-3.5 w-3.5 text-neutral-500" />
            <span>Share / Members</span>
          </Button>

          {/* More options button */}
          <button
            type="button"
            onClick={onOptionsClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-50"
            aria-label="Board options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
