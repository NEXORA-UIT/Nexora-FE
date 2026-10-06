import * as React from "react";

export const KanbanColumnSkeleton: React.FC = () => {
  return (
    <div className="flex gap-5 overflow-hidden animate-pulse">
      {[1, 2, 3].map((col) => (
        <div
          key={col}
          className="w-[320px] min-w-[320px] shrink-0 rounded-2xl border border-neutral-200/90 bg-neutral-50/80 p-3.5 space-y-4"
        >
          {/* Column Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 rounded bg-neutral-200" />
              <div className="h-4 w-5 rounded-full bg-neutral-200" />
            </div>
            <div className="flex gap-1">
              <div className="h-6 w-6 rounded bg-neutral-200" />
              <div className="h-6 w-6 rounded bg-neutral-200" />
            </div>
          </div>

          {/* Cards Skeletons */}
          <div className="space-y-3">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="rounded-xl border border-neutral-200/80 bg-white p-3.5 space-y-3 shadow-2xs"
              >
                <div className="flex justify-between">
                  <div className="h-4 w-14 rounded bg-neutral-100" />
                  <div className="h-4 w-12 rounded bg-neutral-100" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-16 rounded bg-neutral-100" />
                  <div className="h-3.5 w-full rounded bg-neutral-200" />
                  <div className="h-3.5 w-2/3 rounded bg-neutral-200" />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="h-3 w-16 rounded bg-neutral-100" />
                  <div className="h-5 w-5 rounded-full bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Add Card Button Skeleton */}
          <div className="h-8 w-full rounded-xl bg-neutral-200/60" />
        </div>
      ))}
    </div>
  );
};
