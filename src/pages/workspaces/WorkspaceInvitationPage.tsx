import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { workspaceApi } from "@/apis/workspace.api";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ROUTES } from "@/constants/routes";
import { getUserFacingApiError } from "@/utils/api-error-message";

export const WorkspaceInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token")?.trim() ?? "";
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const respond = async (decision: "accept" | "reject") => {
    if (!token) {
      setError("This invitation link is missing its token.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (decision === "accept") {
        await workspaceApi.acceptWorkspaceInvitation(token);
        toast.success("You joined the workspace.");
      } else {
        await workspaceApi.rejectWorkspaceInvitation(token);
        toast.success("Invitation declined.");
      }
      navigate(ROUTES.BOARDS, { replace: true });
    } catch (cause) {
      setError(getUserFacingApiError(cause, "We could not process this invitation."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto mt-12 w-full max-w-lg space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <PageHeader
        title="Workspace invitation"
        description="Accept this invitation using the signed-in account. Its email must match the address the invitation was sent to."
      />
      {!token && (
        <p role="alert" className="text-error-700 mt-4 rounded-lg bg-error-50 p-3 text-sm">
          This invitation link is missing its token.
        </p>
      )}
      {error && (
        <p role="alert" className="text-error-700 mt-4 rounded-lg bg-error-50 p-3 text-sm">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => void respond("reject")}
          disabled={!token || isSubmitting}
        >
          <X className="h-4 w-4" /> Decline
        </Button>
        <Button
          type="button"
          onClick={() => void respond("accept")}
          disabled={!token || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Accept invitation
        </Button>
      </div>
    </main>
  );
};
