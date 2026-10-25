import * as React from "react";
import { Plus, MoreHorizontal, Users, LayoutGrid, Check, Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { WorkspaceHeaderProps } from "@/types";

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  workspace,
  onCreateBoardClick,
  onMoreActionsClick,
  onArchiveClick,
  onRestoreClick,
  canLeaveWorkspace = false,
  leaveWorkspaceDisabledReason,
  onLeaveClick,
}) => {
  const isArchived = workspace.status === "archived";
  const isPaused = workspace.status === "paused";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left: Icon & Meta Details */}
      <div className="flex items-start gap-3.5">
        {/* Workspace Avatar Box */}
        <div className="text-primary-700 shadow-2xs flex h-12 w-12 shrink-0 select-none items-center justify-center rounded-xl bg-primary-100 text-base font-bold">
          {workspace.initials || "WS"}
        </div>

        {/* Workspace Title, Description & Stats */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">{workspace.name}</h1>

            {isArchived ? (
              <span className="inline-flex select-none items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                Archived
              </span>
            ) : isPaused ? (
              <span className="inline-flex select-none items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Paused
              </span>
            ) : (
              <span className="inline-flex select-none items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Active
              </span>
            )}
          </div>

          {workspace.description && (
            <p className="max-w-xl text-xs text-neutral-500">{workspace.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-neutral-500">
            {workspace.memberCount !== undefined && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{workspace.memberCount} members</span>
                </span>
                <span className="text-neutral-300">·</span>
              </>
            )}

            {workspace.activeBoardCount !== undefined && (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{workspace.activeBoardCount} active boards</span>
                </span>
                <span className="text-neutral-300">·</span>
              </>
            )}

            <span>{workspace.teamType}</span>
          </div>
        </div>
      </div>

      {/* Right: Primary Action & Options */}
      <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
        <Button
          type="button"
          disabled={isArchived || isPaused}
          title={
            isArchived
              ? "Board creation is disabled in archived workspaces"
              : isPaused
                ? "Board creation is disabled in frozen workspaces"
                : "Create Board"
          }
          className="shadow-xs h-10 gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onCreateBoardClick}
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Board</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shadow-2xs flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/90 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Workspace options"
              title="More workspace options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onMoreActionsClick}>
              <Check className="mr-2 h-3.5 w-3.5 text-neutral-500" />
              <span>Workspace Details</span>
            </DropdownMenuItem>

            {canLeaveWorkspace || leaveWorkspaceDisabledReason ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLeaveClick}
                  disabled={Boolean(leaveWorkspaceDisabledReason)}
                  className="text-error-700 focus:text-error-800"
                  title={leaveWorkspaceDisabledReason}
                >
                  <span>Leave Workspace</span>
                </DropdownMenuItem>
                {leaveWorkspaceDisabledReason && (
                  <p className="px-2 py-1.5 text-[11px] leading-relaxed text-neutral-500">
                    {leaveWorkspaceDisabledReason}
                  </p>
                )}
              </>
            ) : null}

            {isArchived && onRestoreClick && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onRestoreClick}
                  disabled={isPaused}
                  title={isPaused ? "Restoring is disabled in frozen workspaces" : undefined}
                >
                  <RotateCcw className="text-primary-600 mr-2 h-3.5 w-3.5" />
                  <span>Restore Workspace</span>
                </DropdownMenuItem>
              </>
            )}

            {!isArchived && onArchiveClick && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onArchiveClick}
                  disabled={isPaused}
                  className={
                    isPaused
                      ? "cursor-not-allowed text-neutral-400"
                      : "text-rose-600 focus:text-rose-700"
                  }
                  title={isPaused ? "Archiving is disabled in frozen workspaces" : undefined}
                >
                  <Archive className="mr-2 h-3.5 w-3.5" />
                  <span>Archive Workspace</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
