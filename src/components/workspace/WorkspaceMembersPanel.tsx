import * as React from "react";
import { Loader2, MailPlus, RefreshCw, UserRoundMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceMembership } from "@/hooks";
import { useAuthStore } from "@/stores/auth.store";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { Workspace } from "@/types";

function getMemberInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toLocaleUpperCase() || "?"
  );
}

interface WorkspaceMembersPanelProps {
  workspace: Workspace;
}

export const WorkspaceMembersPanel: React.FC<WorkspaceMembersPanelProps> = ({ workspace }) => {
  const currentUser = useAuthStore((state) => state.user);
  const {
    members,
    invitations,
    isLoading,
    error,
    refresh,
    invite,
    cancelInvitation,
    resendInvitation,
    removeMember,
    transferOwner,
  } = useWorkspaceMembership(workspace.id);
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isOwner = members.some(
    (member) => member.userId === currentUser?.id && member.role === "OWNER"
  );

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      toast.success(successMessage);
    } catch (cause) {
      toast.error(getUserFacingApiError(cause, "Could not complete this action."));
    }
  };

  const handleInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    setIsSubmitting(true);
    try {
      await invite(normalizedEmail);
      setEmail("");
      toast.success("Workspace invitation sent.");
    } catch (cause) {
      toast.error(getUserFacingApiError(cause, "Could not send the invitation."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="workspace-members-heading" className="space-y-5 pt-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="workspace-members-heading" className="text-base font-bold text-neutral-900">
            Workspace members
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            Owners can manage members and pending invitations.
          </p>
        </div>
        {isOwner && (
          <form onSubmit={handleInvite} className="flex w-full items-end gap-2 sm:max-w-md">
            <Input
              type="email"
              label="Member email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isSubmitting || workspace.status === "archived"}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || workspace.status === "archived"}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MailPlus className="h-4 w-4" />
              )}
              <span>Invite</span>
            </Button>
          </form>
        )}
      </div>

      {isLoading ? (
        <div
          role="status"
          className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500"
        >
          Loading members…
        </div>
      ) : error ? (
        <div
          role="alert"
          className="border-error-200 text-error-700 rounded-xl border bg-error-50 p-4 text-sm"
        >
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void refresh()}
          >
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-4 py-3 text-xs font-semibold text-neutral-700">
              Members ({members.length})
            </div>
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    role="img"
                    aria-label={`Avatar for ${member.user.fullName}`}
                    className="text-primary-700 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold"
                  >
                    {getMemberInitials(member.user.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {member.user.fullName}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{member.user.email}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Joined{" "}
                      <time dateTime={member.createdAt}>
                        {new Date(member.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    {member.role === "OWNER" ? "Owner" : "Member"}
                  </span>
                  {isOwner && member.role !== "OWNER" && workspace.status !== "archived" && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Transfer workspace ownership to ${member.user.fullName}?`)) {
                            void runAction(
                              () => transferOwner(member.userId),
                              "Workspace ownership transferred."
                            );
                          }
                        }}
                      >
                        Transfer ownership
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Remove ${member.user.fullName} from workspace`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${member.user.fullName} from this workspace? Their access and assignments will be revoked.`
                            )
                          ) {
                            void runAction(
                              () => removeMember(member.userId),
                              "Member removed from workspace."
                            );
                          }
                        }}
                      >
                        <UserRoundMinus className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                This workspace has no members yet.
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-4 py-3 text-xs font-semibold text-neutral-700">
              Pending invitations ({invitations.length})
            </div>
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">{invitation.email}</p>
                  <p className="text-xs text-neutral-500">
                    Expires {new Date(invitation.expiresAt).toLocaleDateString("en-US")}
                  </p>
                </div>
                {isOwner && workspace.status !== "archived" && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void runAction(() => resendInvitation(invitation.id), "Invitation resent.")
                      }
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Resend
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                          if (window.confirm(`Cancel the invitation sent to ${invitation.email}?`)) {
                            void runAction(() => cancelInvitation(invitation.id), "Invitation canceled.");
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {invitations.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                No pending invitations.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
};
