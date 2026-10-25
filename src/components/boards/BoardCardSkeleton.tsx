import * as React from "react";

export const BoardCardSkeleton: React.FC = () => {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="shadow-xs relative flex min-h-72 flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white"
        >
          <div className="h-28 bg-neutral-100" />

          <div className="flex flex-1 flex-col p-4">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded-md bg-neutral-200" />
              <div className="space-y-1 pt-1">
                <div className="h-3 w-full rounded-md bg-neutral-100" />
                <div className="h-3 w-3/4 rounded-md bg-neutral-100" />
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3">
              <div className="h-3 w-28 rounded bg-neutral-100" />
              <div className="flex items-center -space-x-1.5">
                <div className="h-6 w-6 rounded-full border-2 border-white bg-neutral-200" />
                <div className="h-6 w-6 rounded-full border-2 border-white bg-neutral-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
