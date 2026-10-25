import * as React from "react";
import { FolderPlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserFacingApiError } from "@/utils/api-error-message";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { DOMAIN_CATEGORY_OPTIONS } from "@/constants/workspace";
import type { WorkspaceDomainCategory } from "@/types";

export interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (workspaceId: string) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [domainCategory, setDomainCategory] = React.useState<WorkspaceDomainCategory>("SOFTWARE");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);

  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setDomainCategory("SOFTWARE");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please provide a workspace name.");
      return;
    }
    if (cleanName.length > 120) {
      setError("Workspace name cannot exceed 120 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const created = await createWorkspace({
        name: cleanName,
        description: description.trim() || undefined,
        domainCategory,
      });
      onClose();
      if (onSuccess) {
        onSuccess(created.id);
      }
    } catch (err) {
      setError(getUserFacingApiError(err, "Failed to create workspace."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        size="md"
        aria-labelledby="create-workspace-modal-title"
        onEscapeKeyDown={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isSubmitting) event.preventDefault();
        }}
      >
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="text-primary-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                <FolderPlus className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle
                  id="create-workspace-modal-title"
                  className="text-base font-bold text-neutral-900"
                >
                  Create Workspace
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-neutral-500">
                  Set up a new Workspace for your organization or team.
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close Create Workspace"
                disabled={isSubmitting}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogClose>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <label
              htmlFor="workspace-name-input"
              className="block space-y-1.5 text-xs font-semibold text-neutral-700"
            >
              <span>
                Workspace name <span className="text-error-500">*</span>
              </span>
              <Input
                id="workspace-name-input"
                type="text"
                placeholder="e.g. Core Engineering Platform"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (error) setError("");
                }}
                required
                maxLength={120}
                autoFocus
              />
            </label>
            <label
              htmlFor="workspace-domain-select"
              className="block space-y-1.5 text-xs font-semibold text-neutral-700"
            >
              <span>Domain / Team category</span>
              <select
                id="workspace-domain-select"
                value={domainCategory}
                onChange={(event) =>
                  setDomainCategory(event.target.value as WorkspaceDomainCategory)
                }
                className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
              >
                {DOMAIN_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label
              htmlFor="workspace-desc-input"
              className="block space-y-1.5 text-xs font-semibold text-neutral-700"
            >
              <span>
                Description <span className="font-normal text-neutral-400">(optional)</span>
              </span>
              <textarea
                id="workspace-desc-input"
                rows={3}
                placeholder="Brief description of the Workspace purpose and team goals..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-800 placeholder-neutral-400 outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-medium text-error-600">
                {error}
              </p>
            )}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
