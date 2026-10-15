import * as React from "react";
import { User as UserIcon, Loader2, Check, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { BoardMember } from "@/types";

export interface CardAssigneeSelectorProps {
  cardId: string;
  assignees: BoardMember[];
  members: BoardMember[];
  onAssignMember?: (cardId: string, userId: string) => Promise<void>;
  onUnassignMember?: (cardId: string, userId: string) => Promise<void>;
  isLoadingAssignments?: boolean;
  assignmentsError?: string | null;
  onRetryAssignments?: () => void;
}

export const CardAssigneeSelector: React.FC<CardAssigneeSelectorProps> = ({
  cardId,
  assignees,
  members,
  onAssignMember,
  onUnassignMember,
  isLoadingAssignments = false,
  assignmentsError = null,
  onRetryAssignments,
}) => {
  const [pendingUserId, setPendingUserId] = React.useState<string | null>(null);

  const primaryAssignee = assignees[0];

  const handleToggleAssignee = async (member: BoardMember, isAssigned: boolean) => {
    if (pendingUserId) return;
    setPendingUserId(member.id);
    try {
      if (isAssigned) {
        if (onUnassignMember) {
          await onUnassignMember(cardId, member.id);
        }
      } else {
        if (onAssignMember) {
          await onAssignMember(cardId, member.id);
        }
      }
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        <span className="flex w-28 items-center gap-1.5 font-medium text-neutral-500">
          <UserIcon className="h-3.5 w-3.5" />
          <span>Assignee</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={isLoadingAssignments}
              aria-label="Assign member"
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200/80 bg-neutral-50/80 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60"
            >
              {isLoadingAssignments ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
              ) : assignees.length === 0 ? (
                <>
                  <UserIcon className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-neutral-500">Unassigned</span>
                </>
              ) : assignees.length === 1 ? (
                <>
                  {primaryAssignee.avatarUrl ? (
                    <img
                      src={primaryAssignee.avatarUrl}
                      alt={primaryAssignee.name}
                      className="h-4 w-4 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[9px] font-semibold text-primary-700">
                      {primaryAssignee.initials || primaryAssignee.name.charAt(0)}
                    </span>
                  )}
                  <span className="truncate max-w-[120px]">{primaryAssignee.name}</span>
                </>
              ) : (
                <>
                  <div className="flex -space-x-1.5 items-center shrink-0">
                    {assignees.slice(0, 2).map((a) => (
                      <span
                        key={a.id}
                        className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-primary-100 text-[8px] font-semibold text-primary-700"
                      >
                        {a.initials || a.name.charAt(0)}
                      </span>
                    ))}
                  </div>
                  <span className="truncate max-w-[100px]">{primaryAssignee.name}</span>
                  <span className="text-[10px] text-neutral-500 font-medium">+{assignees.length - 1}</span>
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60 max-h-72 overflow-y-auto">
            <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">
              Assign Members
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {members.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs text-neutral-400">
                No board members available
              </div>
            ) : (
              members.map((m) => {
                const isAssigned = assignees.some((a) => a.id === m.id);
                const isPending = pendingUserId === m.id;
                return (
                  <DropdownMenuItem
                    key={m.id}
                    disabled={Boolean(pendingUserId)}
                    onSelect={(e) => {
                      e.preventDefault();
                      void handleToggleAssignee(m, isAssigned);
                    }}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl}
                          alt={m.name}
                          className="h-5 w-5 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                          {m.initials || m.name.charAt(0)}
                        </span>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-neutral-800">{m.name}</span>
                        {m.role && (
                          <span className="text-[10px] text-neutral-400 leading-tight">
                            {m.role}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center w-4 h-4 justify-center">
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                      ) : isAssigned ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : null}
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Assignments Error / Retry Banner */}
      {assignmentsError && (
        <div className="flex items-center gap-1.5 pl-28 text-[11px] text-amber-700">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{assignmentsError}</span>
          {onRetryAssignments && (
            <button
              type="button"
              onClick={onRetryAssignments}
              className="font-medium underline hover:text-amber-800 shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};
