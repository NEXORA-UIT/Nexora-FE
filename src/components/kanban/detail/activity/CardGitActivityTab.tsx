import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  ExternalLink,
  GitCommitHorizontal,
  GitPullRequest,
  RotateCcw,
} from "lucide-react";
import type { GitActivityItem, GitActivityFeed } from "@/types";

interface CardGitActivityTabProps {
  items: GitActivityItem[];
  source: GitActivityFeed["source"] | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const CardGitActivityTab: React.FC<CardGitActivityTabProps> = ({
  items,
  source,
  isLoading,
  error,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <p role="status" className="py-4 text-center text-xs text-neutral-500">
        Loading Git activity…
      </p>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-error-200 text-error-700 flex items-center justify-between gap-3 rounded-lg border bg-error-50 p-3 text-xs"
      >
        <span>{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 font-medium"
        >
          <RotateCcw className="h-3 w-3" />
          Try again
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-2 text-xs italic text-neutral-500">
        No Git activity yet. Add the Card code to a commit message or pull request, for example #NEX-xxx.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {source === "DEMO" && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800"
        >
          Demo data — Git activity is not connected to the backend yet.
        </p>
      )}
      {items.map((item) => {
        const Icon = item.type === "PULL_REQUEST" ? GitPullRequest : GitCommitHorizontal;
        let timestamp = item.timestamp;
        try {
          timestamp = format(parseISO(item.timestamp), "MMM d, yyyy · h:mm a");
        } catch {
          /* Display the raw timestamp if parsing fails. */
        }
        return (
          <article key={item.id} className="flex gap-3 rounded-lg border border-neutral-200 p-3">
            <Icon
              className={`mt-0.5 h-4 w-4 shrink-0 ${item.type === "PULL_REQUEST" ? "text-primary-600" : "text-neutral-500"}`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="break-words text-xs font-medium text-neutral-900">{item.message}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-500">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary-700 inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-neutral-700"
                >
                  {item.identifier}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <span>{item.author}</span>
                <time dateTime={item.timestamp}>{timestamp}</time>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
