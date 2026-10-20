import * as React from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceMembership } from "@/hooks";
import { DOMAIN_CATEGORY_LABELS } from "@/mappers/workspace.mapper";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { Workspace, WorkspaceDomainCategory, UpdateWorkspaceRequest } from "@/types";

const DOMAIN_OPTIONS = Object.entries(DOMAIN_CATEGORY_LABELS) as [
  WorkspaceDomainCategory,
  string,
][];

function getDomainCategory(teamType: string): WorkspaceDomainCategory {
  return DOMAIN_OPTIONS.find(([, label]) => label === teamType)?.[0] ?? "OTHER";
}

interface WorkspaceSettingsPanelProps {
  workspace: Workspace;
}

export const WorkspaceSettingsPanel: React.FC<WorkspaceSettingsPanelProps> = ({ workspace }) => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const membership = useWorkspaceMembership(workspace.id);
  const [name, setName] = React.useState(workspace.name);
  const [description, setDescription] = React.useState(workspace.description);
  const [domainCategory, setDomainCategory] = React.useState(() => getDomainCategory(workspace.teamType));
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(workspace.name);
    setDescription(workspace.description);
    setDomainCategory(getDomainCategory(workspace.teamType));
    setError(null);
  }, [workspace.id, workspace.name, workspace.description, workspace.teamType]);

  const isOwner = membership.members.some(
    (member) => member.userId === currentUserId && member.role === "OWNER"
  );
  const canEdit =
    isOwner && workspace.status === "active" && !workspace.isFrozen && !membership.isLoading && !membership.error;
  const changedFields: UpdateWorkspaceRequest = {};

  if (name.trim() !== workspace.name) changedFields.name = name.trim();
  if (description !== workspace.description) changedFields.description = description;
  if (domainCategory !== getDomainCategory(workspace.teamType)) {
    changedFields.domainCategory = domainCategory;
  }
  const hasChanges = Object.keys(changedFields).length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || !hasChanges || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await useWorkspaceStore.getState().updateWorkspace(workspace.id, changedFields);
      toast.success("Workspace settings saved.");
    } catch (cause) {
      setError(getUserFacingApiError(cause, "Could not update workspace. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="workspace-settings-heading" className="space-y-6 pt-2">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="workspace-settings-heading" className="text-lg font-semibold text-slate-900">
              Workspace settings
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Update the details your team sees across this workspace.
            </p>
          </div>
        </div>

        {!canEdit && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {membership.isLoading
              ? "Checking your workspace access…"
              : "Only the workspace owner can edit active workspace settings."}
          </div>
        )}
        {membership.error && (
          <div role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <p>{membership.error}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void membership.refresh()}>
              Try again
            </Button>
          </div>
        )}
        {error && (
          <div role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Workspace name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              disabled={!canEdit || isSubmitting}
              required
            />
            <div className="space-y-1.5">
              <label htmlFor="workspace-domain-category" className="block text-xs font-medium text-slate-700">
                Workspace type
              </label>
              <select
                id="workspace-domain-category"
                value={domainCategory}
                onChange={(event) => setDomainCategory(event.target.value as WorkspaceDomainCategory)}
                disabled={!canEdit || isSubmitting}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                {DOMAIN_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="workspace-description" className="block text-xs font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="workspace-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={4}
              disabled={!canEdit || isSubmitting}
              className="w-full resize-y rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />
            <p className="text-right text-xs text-slate-400">{description.length}/500</p>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Workspace URL: /{workspace.slug}</p>
            <Button type="submit" disabled={!canEdit || !hasChanges || isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Save aria-hidden="true" className="h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
