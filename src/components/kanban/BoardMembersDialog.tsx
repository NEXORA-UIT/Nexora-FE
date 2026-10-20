import * as React from "react";
import { Copy, Loader2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBoardMembership } from "@/hooks";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { BoardDetail } from "@/types";

interface BoardMembersDialogProps {
  board: BoardDetail;
  isOpen: boolean;
  isWorkspaceOwner: boolean;
  onClose: () => void;
}

export const BoardMembersDialog: React.FC<BoardMembersDialogProps> = ({
  board,
  isOpen,
  isWorkspaceOwner,
  onClose,
}) => {
  const { members, workspaceMembers, isLoading, error, addMember, removeMember, assignPm } =
    useBoardMembership(board.id, board.workspaceId);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const boardMemberIds = new Set(members.map((member) => member.id));
  const availableMembers = workspaceMembers.filter(
    (member) => member.user.status === "ACTIVE" && !boardMemberIds.has(member.userId)
  );
  const currentPm = members.find((member) => member.role === "PM");
  const canManageMembers = isWorkspaceOwner || members.some((member) => member.role === "PM");

  const copyBoardLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Board link copied to clipboard.");
    } catch {
      toast.error("Could not copy the board link.");
    }
  };

  if (!isOpen) return null;

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setIsSaving(true);
    try {
      await action();
      toast.success(successMessage);
    } catch (cause) {
      toast.error(getUserFacingApiError(cause, "Could not update Board members."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="board-members-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="w-full max-w-2xl space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="board-members-title" className="text-base font-bold text-neutral-900">
              Board members
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              {board.name}. The Owner can access every Board; the assigned PM manages this Board.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void copyBoardLink()}>
              <Copy className="h-3.5 w-3.5" />
              Copy board link
            </Button>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {isWorkspaceOwner && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <label
              htmlFor="board-pm-select"
              className="mb-2 block text-xs font-semibold text-neutral-700"
            >
              Board PM
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
                className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
              Assigning a PM does not change the workspace Owner.
            </p>
          </div>
        )}

        {canManageMembers && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!selectedUserId) return;
              void runAction(async () => {
                await addMember(selectedUserId);
                setSelectedUserId("");
              }, "Member added to Board.");
            }}
            className="flex items-end gap-2"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="board-member-select"
                className="mb-1.5 block text-xs font-semibold text-neutral-700"
              >
                Add a workspace member to this Board
              </label>
              <select
                id="board-member-select"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                disabled={isLoading || availableMembers.length === 0 || isSaving}
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
            <Button type="submit" size="sm" disabled={!selectedUserId || isSaving}>
              <UserPlus className="h-4 w-4" />
              Add member
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
          <div className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">{member.name}</p>
                  <p className="text-xs text-neutral-500">
                    {member.role === "PM" ? "PM" : "Member"}
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
                          "Member removed from Board."
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

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </section>
    </div>
  );
};
