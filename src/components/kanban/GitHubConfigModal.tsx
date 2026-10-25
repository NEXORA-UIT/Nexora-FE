import * as React from "react";
import { Copy, Github, Loader2, Unplug, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { GITHUB_WEBHOOK_URL, githubApi } from "@/apis/github.api";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { BoardDetail, GitHubConfig } from "@/types";

interface GitHubConfigModalProps {
  board: BoardDetail;
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubConfigModal: React.FC<GitHubConfigModalProps> = ({ board, isOpen, onClose }) => {
  const [config, setConfig] = React.useState<GitHubConfig | null>(null);
  const [repositoryName, setRepositoryName] = React.useState("");
  const [webhookSecret, setWebhookSecret] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [backendError, setBackendError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    let isActive = true;
    setIsLoading(true);
    setBackendError(null);
    void githubApi
      .getGitHubConfig(board.id)
      .then((data) => {
        if (!isActive) return;
        setConfig(data);
        setRepositoryName(data.repositoryName);
      })
      .catch(() => {
        if (!isActive) return;
        setConfig(null);
        setBackendError(
          "GitHub configuration is not available yet. The backend route has not been implemented."
        );
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [board.id, isOpen]);

  const handleConfigure = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setBackendError(null);
    try {
      const savedConfig = await githubApi.configureGitHub(board.id, {
        repositoryName: repositoryName.trim(),
        webhookSecret,
      });
      setConfig(savedConfig);
      setRepositoryName(savedConfig.repositoryName);
      setWebhookSecret("");
      toast.success("GitHub connected to this Board.");
    } catch (cause) {
      setBackendError(
        getUserFacingApiError(
          cause,
          "GitHub configuration is not available yet. The backend route has not been implemented."
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsSaving(true);
    setBackendError(null);
    try {
      await githubApi.disconnectGitHub(board.id);
      setConfig(null);
      setRepositoryName("");
      toast.success("GitHub disconnected from this Board.");
    } catch (cause) {
      setBackendError(getUserFacingApiError(cause, "Could not disconnect GitHub from this Board."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(config?.webhookUrl || GITHUB_WEBHOOK_URL);
      toast.success("Webhook URL copied.");
    } catch {
      toast.error("Could not copy the webhook URL.");
    }
  };

  if (!isOpen) return null;

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSaving) onClose();
      }}
    >
      <DialogContent
        size="md"
        aria-labelledby="github-config-title"
        onEscapeKeyDown={(event) => {
          if (isSaving) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (isSaving) event.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
              <Github className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle
                id="github-config-title"
                className="text-base font-bold text-neutral-900"
              >
                GitHub Connector
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-neutral-500">
                Connect a repository to Board {board.name}.
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close GitHub connector"
              disabled={isSaving}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {config?.isActive ? (
            <div className="border-success-200 text-success-800 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-success-50 px-4 py-3 text-sm">
              <span className="min-w-0 truncate">Connected · {config.repositoryName}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => void handleDisconnect()}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="h-4 w-4" />
                )}
                Disconnect
              </Button>
            </div>
          ) : (
            <form onSubmit={(event) => void handleConfigure(event)} className="space-y-4">
              <label className="block space-y-1.5 text-xs font-semibold text-neutral-700">
                <span>Repository (owner/repo)</span>
                <input
                  aria-label="Repository (owner/repo)"
                  required
                  pattern="[^/]+/[^/]+"
                  placeholder="nexora-org/nexora-backend"
                  value={repositoryName}
                  onChange={(event) => setRepositoryName(event.target.value)}
                  disabled={isLoading || isSaving}
                  className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </label>
              <label className="block space-y-1.5 text-xs font-semibold text-neutral-700">
                <span>Webhook secret</span>
                <input
                  aria-label="Webhook Secret"
                  type="password"
                  required
                  value={webhookSecret}
                  onChange={(event) => setWebhookSecret(event.target.value)}
                  disabled={isLoading || isSaving}
                  className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </label>
              <Button type="submit" disabled={isLoading || isSaving}>
                {isSaving || isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                Connect
              </Button>
            </form>
          )}

          <div className="space-y-2 rounded-xl bg-neutral-50 p-4">
            <label
              htmlFor="github-webhook-url"
              className="block text-xs font-semibold text-neutral-700"
            >
              Webhook URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="github-webhook-url"
                readOnly
                value={config?.webhookUrl || GITHUB_WEBHOOK_URL}
                className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-600"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopyWebhookUrl()}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>

          {backendError && (
            <p
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              {backendError}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
