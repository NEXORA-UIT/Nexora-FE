import * as React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Copy, Crown, Loader2, ShieldCheck, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBoardMembership } from "@/hooks";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { BoardDetail } from "@/types";

interface BoardMembersDialogProps {
  board: BoardDetail;
  isOpen: boolean;
  isWorkspaceOwner: boolean;
  currentUserId?: string;
  onClose: () => void;
  onMembersChange?: () => void;
}

export const BoardMembersDialog: React.FC<BoardMembersDialogProps> = ({
  board,
  isOpen,
  isWorkspaceOwner,
  currentUserId,
  onClose,
  onMembersChange,
}) => {
  const { members, workspaceMembers, isLoading, error, addMember, removeMember, assignPm } =
    useBoardMembership(board.id, board.workspaceId);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const boardMemberIds = new Set(members.map((member) => member.id));
  const availableMembers = workspaceMembers.filter(
    (member) => member.user.status === "ACTIVE" && !boardMemberIds.has(member.userId)
  );
  const workspaceOwner = workspaceMembers.find((member) => member.role === "OWNER");
  const currentPm = members.find((member) => member.role === "PM");
  const isCurrentUserPm = Boolean(currentUserId && currentPm?.id === currentUserId);
  const canManageMembers = isWorkspaceOwner || isCurrentUserPm;

  const copyBoardLink = async () => {
    if (!navigator.clipboard?.writeText) {
      toast.error("Clipboard copy is not supported by your browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Board link copied to clipboard.");
    } catch {
      toast.error("Failed to copy board link.");
    }
  };

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setIsSaving(true);
    try {
      await action();
      onMembersChange?.();
      toast.success(successMessage);
    } catch (cause) {
      toast.error(getUserFacingApiError(cause, "Could not update Board members."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogContent
        size="lg"
        aria-labelledby="board-members-title"
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isSaving) event.preventDefault();
        }}
      >
        <DialogHeader className="border-b-0 pb-3">
          <div className="min-w-0 flex-1">
            <DialogTitle id="board-members-title" className="text-base font-bold text-neutral-900">
              Board members
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-neutral-500">
              {board.name}. The Owner can access every Board; the assigned PM manages this Board.
            </DialogDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Copy link"
              onClick={() => void copyBoardLink()}
              className="whitespace-nowrap px-2.5 sm:px-3"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Copy board link</span>
            </Button>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close board members"
                disabled={isSaving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </div>
        </DialogHeader>

        <DialogBody className="flex min-h-0 flex-1 flex-col overflow-hidden pt-1">
          <Tabs.Root defaultValue="access" className="flex min-h-0 flex-1 flex-col">
            <Tabs.List
              aria-label="Board information"
              className="mb-4 inline-flex shrink-0 self-start rounded-xl bg-neutral-100 p-1"
            >
              <Tabs.Trigger
                value="access"
                className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-600 transition-colors data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm"
              >
                Access &amp; roles
              </Tabs.Trigger>
              <Tabs.Trigger
                value="members"
                className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-600 transition-colors data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm"
              >
                Members
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="access" className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              <section aria-labelledby="board-access-title" className="space-y-3">
                <div>
                  <h3 id="board-access-title" className="text-sm font-semibold text-neutral-900">
                    Board access &amp; roles
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    See who owns the Workspace and who manages this Board.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-3.5">
                    <div className="text-primary-800 flex items-center gap-2 text-xs font-semibold">
                      <Crown className="h-4 w-4" aria-hidden="true" />
                      Workspace Owner
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-neutral-900">
                      {isLoading
                        ? "Loading…"
                        : error
                          ? "Unavailable"
                          : workspaceOwner?.user.fullName ||
                            workspaceOwner?.user.email ||
                            "Not found"}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-600">
                      Can access every Board in this Workspace
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      Board PM
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-neutral-900">
                      {isLoading
                        ? "Loading…"
                        : error
                          ? "Unavailable"
                          : currentPm?.name || "Not assigned"}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-600">Manages this Board</p>
                  </div>
                </div>
                <p className="rounded-lg bg-neutral-50 px-3 py-2 text-[11px] leading-relaxed text-neutral-600">
                  Board members can access this Board only. Workspace membership alone does not
                  grant access to every Board.
                </p>
              </section>

              {isWorkspaceOwner && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <label
                    htmlFor="board-pm-select"
                    className="mb-2 block text-xs font-semibold text-neutral-700"
                  >
                    Assign Board PM
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="board-pm-select"
                      value={currentPm?.id ?? ""}
                      onChange={(event) => {
                        const userId = event.target.value;
                        if (userId && userId !== currentPm?.id)
                          void runAction(() => assignPm(userId), "Board PM updated.");
                      }}
                      disabled={isLoading || isSaving}
                      className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Select a PM</option>
                      {workspaceMembers
                        .filter((member) => member.user.status === "ACTIVE")
                        .map((member) => (
                          <option key={member.userId} value={member.userId}>
                            {member.user.fullName} ({member.role === "OWNER" ? "Owner" : "Member"})
                          </option>
                        ))}
                    </select>
                    {isSaving && (
                      <Loader2 className="text-primary-600 h-4 w-4 animate-spin self-center" />
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-neutral-500">
                    Assigning a PM does not change the Workspace Owner.
                  </p>
                </div>
              )}
            </Tabs.Content>

            <Tabs.Content value="members" className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {canManageMembers && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!selectedUserId) return;
                    void runAction(async () => {
                      await addMember(selectedUserId);
                      setSelectedUserId("");
                    }, "Member added to board.");
                  }}
                  className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end"
                >
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="board-member-select"
                      className="mb-1.5 block text-xs font-semibold text-neutral-700"
                    >
                      Add Workspace member to this Board
                    </label>
                    <select
                      id="board-member-select"
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                      disabled={isLoading || availableMembers.length === 0 || isSaving}
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">
                        {availableMembers.length ? "Select a member" : "No more members to add"}
                      </option>
                      {availableMembers.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.user.fullName} · {member.user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" disabled={!selectedUserId || isSaving} className="shrink-0">
                    <UserPlus className="h-4 w-4" />
                    Add to board
                  </Button>
                </form>
              )}

              {isLoading ? (
                <p role="status" className="py-4 text-center text-sm text-neutral-500">
                  Loading members…
                </p>
              ) : error ? (
                <p role="alert" className="text-error-700 rounded-lg bg-error-50 p-3 text-sm">
                  {error}
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-neutral-200">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {member.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {member.role === "PM" ? "Board PM" : "Board member"}
                        </p>
                      </div>
                      {canManageMembers && member.role !== "PM" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSaving}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remove ${member.name} from this Board? Their Board assignments will also be removed.`
                              )
                            ) {
                              void runAction(
                                () => removeMember(member.id),
                                "Member removed from board."
                              );
                            }
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-neutral-500">
                      No Board members yet.
                    </p>
                  )}
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};
