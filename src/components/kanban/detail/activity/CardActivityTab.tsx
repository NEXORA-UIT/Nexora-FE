import * as React from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { formatActivityTimestamp } from "@/utils/date";
import type { CardActivity } from "@/types";

export interface CardActivityTabProps {
  activities: CardActivity[] | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  nextCursor: string | null;
  onRetry: () => void;
  onLoadMore: () => Promise<void>;
}

export const CardActivityTab: React.FC<CardActivityTabProps> = ({
  activities,
  isLoading,
  isLoadingMore,
  error,
  nextCursor,
  onRetry,
  onLoadMore,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2.5 animate-pulse">
            <div className="h-5 w-5 rounded-full bg-neutral-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-neutral-200" />
              <div className="h-2.5 w-1/3 rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 text-xs text-neutral-600">
        <span>{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700 underline cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (activities && activities.length > 0) {
    return (
      <div className="space-y-3">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center gap-2.5 text-xs">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-medium text-neutral-700">
              {act.user.initials || act.user.name.charAt(0)}
            </span>
            <div className="flex-1">
              <span className="font-semibold text-neutral-800">{act.user.name} </span>
              <span className="text-neutral-600">{act.action} </span>
              <span className="text-[11px] text-neutral-400">
                ({formatActivityTimestamp(act.createdAt)})
              </span>
            </div>
          </div>
        ))}

        {nextCursor && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => void onLoadMore()}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-neutral-500" />
                  <span>Loading more...</span>
                </>
              ) : (
                <span>Load more activity</span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <p className="text-xs text-neutral-400 italic">No activity recorded yet.</p>
  );
};
