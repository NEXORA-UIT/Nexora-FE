import * as React from "react";
import { Copy, Github, Loader2, Unplug, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
      setBackendError(
        getUserFacingApiError(cause, "Could not disconnect GitHub from this Board.")
      );
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-config-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="w-full max-w-lg space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Github className="h-5 w-5" />
            </span>
            <div>
              <h2 id="github-config-title" className="text-base font-bold text-neutral-900">
                GitHub Connector
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Connect a repository to Board {board.name}.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {config?.isActive ? (
          <div className="border-success-200 text-success-800 flex items-center justify-between rounded-lg border bg-success-50 px-3 py-2 text-sm">
            <span>● Connected · {config.repositoryName}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => void handleDisconnect()}
            >
              <Unplug className="h-3.5 w-3.5" />
              Disconnect
            </Button>
          </div>
        ) : (
          <form onSubmit={(event) => void handleConfigure(event)} className="space-y-4">
            <label className="block space-y-1 text-xs font-semibold text-neutral-700">
              <span>Repository (owner/repo)</span>
              <input
                aria-label="Repository (owner/repo)"
                required
                pattern="[^/]+/[^/]+"
                placeholder="nexora-org/nexora-backend"
                value={repositoryName}
                onChange={(event) => setRepositoryName(event.target.value)}
                disabled={isLoading || isSaving}
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </label>
            <label className="block space-y-1 text-xs font-semibold text-neutral-700">
              <span>Webhook Secret</span>
              <input
                aria-label="Webhook Secret"
                type="password"
                required
                value={webhookSecret}
                onChange={(event) => setWebhookSecret(event.target.value)}
                disabled={isLoading || isSaving}
                className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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

        <div className="space-y-1">
          <label
            htmlFor="github-webhook-url"
            className="block text-xs font-semibold text-neutral-700"
          >
            Webhook URL
          </label>
          <div className="flex gap-2">
            <input
              id="github-webhook-url"
              readOnly
              value={config?.webhookUrl || GITHUB_WEBHOOK_URL}
              className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-xs text-neutral-600"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopyWebhookUrl()}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Webhook URL
            </Button>
          </div>
        </div>

        {backendError && (
          <p
            role="alert"
            className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
          >
            {backendError}
          </p>
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
