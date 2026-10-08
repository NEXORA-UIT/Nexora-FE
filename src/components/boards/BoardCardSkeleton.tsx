import * as React from "react";

export const BoardCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="relative flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs overflow-hidden"
        >
          {/* Top Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200" />

          {/* Title & Description Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 w-40 rounded-md bg-neutral-200" />
              <div className="h-5 w-5 rounded-md bg-neutral-100" />
            </div>
            <div className="space-y-1 pt-1">
              <div className="h-3 w-full rounded-md bg-neutral-100" />
              <div className="h-3 w-3/4 rounded-md bg-neutral-100" />
            </div>
          </div>

          {/* Progress & Avatars Skeleton */}
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-neutral-100" />
                <div className="h-3 w-16 rounded bg-neutral-100" />
              </div>
              <div className="h-1.5 w-full rounded-full bg-neutral-100" />
            </div>

            <div className="flex items-center -space-x-1.5">
              <div className="h-6 w-6 rounded-full border-2 border-white bg-neutral-200" />
              <div className="h-6 w-6 rounded-full border-2 border-white bg-neutral-200" />
              <div className="h-6 w-6 rounded-full border-2 border-white bg-neutral-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
