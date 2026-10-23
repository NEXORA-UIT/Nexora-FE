import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, UserPlus, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { BoardDetail, WebSocketStatus } from "@/types";

export interface BoardDetailHeaderProps {
  board: BoardDetail;
  workspaceName?: string;
  wsStatus?: WebSocketStatus;
  isLive?: boolean;
  onShareClick?: () => void;
  onOptionsClick?: () => void;
  canManageBoard?: boolean;
  onEditBoardClick?: () => void;
  isEditDisabled?: boolean;
  editDisabledReason?: string;
}

export const BoardDetailHeader: React.FC<BoardDetailHeaderProps> = ({
  board,
  workspaceName = "Workspace",
  wsStatus,
  isLive,
  onShareClick,
  onOptionsClick,
  canManageBoard = false,
  onEditBoardClick,
  isEditDisabled = false,
  editDisabledReason,
}) => {
  const members = board.members || [];
  const visibleMembers = members.slice(0, 4);
  const remainingCount = Math.max(0, members.length - 4);

  return (
    <div className="space-y-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/80 p-4 shadow-sm select-none sm:p-5">
      {/* 1. Breadcrumb Hierarchy */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link
          to={ROUTES.BOARDS}
          className="font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          {workspaceName}
        </Link>
        <ChevronRight className="h-3 w-3 text-neutral-400" />
        <span className="font-semibold text-neutral-900">{board.name}</span>
      </nav>

      {/* 2. Title, Description, and Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Board Title & Active Badge */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {board.name}
            </h1>

            {board.status === "ACTIVE" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 border border-primary-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                Active
              </span>
            )}

            {wsStatus && (() => {
              const live = isLive ?? wsStatus === "CONNECTED";
              return (
                <span
                  data-testid="realtime-status-pill"
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
                    live && "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                    !live && (wsStatus === "CONNECTING" || wsStatus === "RECONNECTING" || wsStatus === "CONNECTED") && "bg-amber-50 text-amber-700 border-amber-200/60",
                    wsStatus === "DISCONNECTED" && "bg-neutral-100 text-neutral-600 border-neutral-200"
                  )}
                  title={`Realtime Status: ${live ? "Live" : wsStatus}`}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      live && "bg-emerald-600",
                      !live && (wsStatus === "CONNECTING" || wsStatus === "RECONNECTING" || wsStatus === "CONNECTED") && "bg-amber-500 animate-pulse",
                      wsStatus === "DISCONNECTED" && "bg-neutral-400"
                    )}
                  />
                  {live
                    ? "Live"
                    : wsStatus === "RECONNECTING"
                    ? "Reconnecting..."
                    : wsStatus === "DISCONNECTED"
                    ? "Offline"
                    : "Connecting..."}
                </span>
              );
            })()}
          </div>

          {board.description && (
            <p className="mt-1 text-xs text-neutral-500 max-w-2xl leading-relaxed">
              {board.description}
            </p>
          )}
        </div>

        {/* Right: Members Stack, Share Button, and Options */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {/* Avatar stack */}
          <div className="flex items-center -space-x-2">
            {visibleMembers.map((member) => (
              <div
                key={member.id}
                title={member.name}
                aria-label={member.name}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary-600 text-[11px] font-bold text-white shadow-2xs transition-transform hover:scale-110 hover:z-10 cursor-default"
              >
                {member.initials}
              </div>
            ))}

            {remainingCount > 0 && (
              <div
                title={`${remainingCount} more members`}
                aria-label={`${remainingCount} more members`}
                className="flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-neutral-100 px-1 text-[11px] font-semibold text-neutral-700 shadow-2xs hover:z-10 cursor-default"
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

          {/* More options dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={onOptionsClick}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                aria-label="Board options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={!isEditDisabled && canManageBoard ? onEditBoardClick : undefined}
                disabled={!canManageBoard || isEditDisabled}
                title={
                  !canManageBoard
                    ? "Only Workspace Owners and Board PMs can edit board details."
                    : isEditDisabled
                    ? editDisabledReason
                    : undefined
                }
                className="gap-2 text-xs cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5 text-neutral-500" />
                <span>Edit Board Details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
