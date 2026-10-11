import * as React from "react";
import {
  Plus,
  MoreHorizontal,
  Users,
  LayoutGrid,
  Check,
  Archive,
  RotateCcw,
} from "lucide-react";
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
}) => {
  const isArchived = workspace.status === "archived";
  const isPaused = workspace.status === "paused";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left: Icon & Meta Details */}
      <div className="flex items-start gap-3.5">
        {/* Workspace Avatar Box */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 font-bold text-base text-primary-700 select-none shadow-2xs">
          {workspace.initials || "WS"}
        </div>

        {/* Workspace Title, Description & Stats */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {workspace.name}
            </h1>

            {isArchived ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300/80 bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                Archived
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Paused
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Active
              </span>
            )}
          </div>

          {workspace.description && (
            <p className="text-xs text-neutral-500 max-w-xl">
              {workspace.description}
            </p>
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
      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
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
          className="h-10 gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-xs hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onCreateBoardClick}
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Board</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/90 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Workspace options"
              title="More workspace options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onMoreActionsClick}>
              <Check className="h-3.5 w-3.5 text-neutral-500 mr-2" />
              <span>Workspace Details</span>
            </DropdownMenuItem>

            {isArchived && onRestoreClick && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onRestoreClick}
                  disabled={isPaused}
                  title={isPaused ? "Restoring is disabled in frozen workspaces" : undefined}
                >
                  <RotateCcw className="h-3.5 w-3.5 text-primary-600 mr-2" />
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
                  className={isPaused ? "text-neutral-400 cursor-not-allowed" : "text-rose-600 focus:text-rose-700"}
                  title={isPaused ? "Archiving is disabled in frozen workspaces" : undefined}
                >
                  <Archive className="h-3.5 w-3.5 mr-2" />
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
