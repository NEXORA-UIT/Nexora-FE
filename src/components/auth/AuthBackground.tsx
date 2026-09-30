import * as React from "react";

export const AuthBackground: React.FC = () => {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ---------------------------------------------------------------------
          1. Top Left Floating Card (with purple top-left accent diamond)
          --------------------------------------------------------------------- */}
      <div className="absolute top-16 left-10 hidden w-52 rounded-2xl border border-neutral-200/90 bg-white/95 p-4 shadow-lg backdrop-blur-xs xl:block 2xl:left-24">
        {/* Purple Accent Diamond */}
        <div className="absolute -top-1 -left-1 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#6366F1]" />

        {/* Skeleton content lines */}
        <div className="h-1.5 w-14 rounded bg-neutral-300" />
        <div className="mt-2.5 space-y-1.5">
          <div className="h-1.5 w-28 rounded bg-neutral-200" />
          <div className="h-1.5 w-20 rounded bg-neutral-200" />
        </div>
        <div className="mt-3 flex justify-end">
          <div className="h-3.5 w-3.5 rounded-full bg-neutral-300" />
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          2. Middle Left Floating Card: Sprint Velocity & Burndown Chart
          --------------------------------------------------------------------- */}
      <div className="absolute top-[48%] -translate-y-1/2 left-10 hidden w-52 rounded-2xl border border-neutral-200/90 bg-white/95 p-3.5 shadow-lg backdrop-blur-xs xl:block 2xl:left-24">
        {/* Purple Accent Diamond */}
        <div className="absolute -top-1 -left-1 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#6366F1]" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-16 rounded bg-neutral-300" />
          <div className="h-1.5 w-6 rounded-full bg-success-500" />
        </div>

        {/* Mini Velocity Bar Chart Graphic */}
        <div className="mt-3 flex items-end justify-between gap-1.5 h-10 border-b border-neutral-100 pb-1">
          <div className="h-3 w-full rounded-t bg-neutral-200" />
          <div className="h-5 w-full rounded-t bg-neutral-300" />
          <div className="h-7 w-full rounded-t bg-primary-300" />
          <div className="h-8 w-full rounded-t bg-primary-400" />
          <div className="h-10 w-full rounded-t bg-primary-600" />
        </div>

        {/* Sub-lines */}
        <div className="mt-2 flex items-center justify-between">
          <div className="h-1.5 w-12 rounded bg-neutral-300" />
          <div className="h-1.5 w-8 rounded bg-primary-500" />
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          3. Bottom Left Kanban Mockup Board
          --------------------------------------------------------------------- */}
      <div className="absolute bottom-20 left-6 hidden w-[360px] rounded-2xl border border-neutral-200 bg-[#EDF2F7] p-3.5 shadow-xl xl:block 2xl:left-16 2xl:w-[400px]">
        {/* Board Topbar */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
          <div className="h-2 w-16 rounded bg-neutral-400" />
          <div className="h-3 w-8 rounded-full bg-[#4338CA]" />
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-full bg-neutral-300" />
            <div className="h-3 w-3 rounded-full bg-neutral-300" />
          </div>
        </div>

        {/* 3 Columns */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {/* Column 1 */}
          <div className="space-y-2 rounded-xl bg-white/60 p-2">
            <div className="h-1.5 w-8 rounded bg-neutral-400" />
            <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-xs">
              <div className="h-1 w-5 rounded bg-primary-600" />
              <div className="mt-2 h-1.5 w-full rounded bg-neutral-700" />
              <div className="mt-1 h-1.5 w-3/4 rounded bg-neutral-300" />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-xs">
              <div className="h-1 w-4 rounded bg-warning-500" />
              <div className="mt-2 h-1.5 w-full rounded bg-neutral-700" />
              <div className="mt-2 flex gap-1">
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              </div>
            </div>
          </div>

          {/* Column 2 (Highlighted Active) */}
          <div className="space-y-2 rounded-xl bg-white/60 p-2">
            <div className="h-1.5 w-10 rounded bg-[#4338CA]" />
            <div className="rounded-lg border-2 border-[#4F46E5] bg-white p-2 shadow-xs">
              <div className="h-1.5 w-5 rounded bg-[#EEF2FF]" />
              <div className="mt-2 h-1.5 w-full rounded bg-neutral-900" />
              <div className="mt-1 h-1.5 w-5/6 rounded bg-neutral-400" />
              <div className="mt-2 h-1 w-full rounded bg-success-500" />
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-2 rounded-xl bg-white/60 p-2">
            <div className="h-1.5 w-8 rounded bg-success-500" />
            <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-500 shrink-0" />
                <div className="h-1.5 w-12 rounded bg-neutral-700" />
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-success-500 shrink-0" />
                <div className="h-1.5 w-14 rounded bg-neutral-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          4. Top Right Floating Card (with purple top-right accent diamond)
          --------------------------------------------------------------------- */}
      <div className="absolute top-16 right-10 hidden w-52 rounded-2xl border border-neutral-200/90 bg-white/95 p-4 shadow-lg backdrop-blur-xs xl:block 2xl:right-24">
        {/* Purple Accent Diamond */}
        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#6366F1]" />

        {/* Skeleton content lines */}
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-16 rounded bg-neutral-300" />
        </div>
        <div className="mt-3">
          <div className="h-2 w-32 rounded bg-[#4F46E5]" />
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          5. Middle Right Floating Card: Task Checklist & Issue Detail
          --------------------------------------------------------------------- */}
      <div className="absolute top-[48%] -translate-y-1/2 right-10 hidden w-52 rounded-2xl border border-neutral-200/90 bg-white/95 p-3.5 shadow-lg backdrop-blur-xs xl:block 2xl:right-24">
        {/* Purple Accent Diamond */}
        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#6366F1]" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-1.5 w-12 rounded bg-warning-500" />
          <div className="h-2 w-2 rounded-full bg-neutral-300" />
        </div>

        {/* Title line */}
        <div className="mt-2 h-1.5 w-28 rounded bg-neutral-700" />

        {/* Checklist items */}
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-success-500 shrink-0" />
            <div className="h-1.5 w-24 rounded bg-neutral-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-success-500 shrink-0" />
            <div className="h-1.5 w-20 rounded bg-neutral-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full border border-neutral-300 shrink-0" />
            <div className="h-1.5 w-16 rounded bg-neutral-300" />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-3 flex items-center justify-between pt-1 border-t border-neutral-100">
          <div className="flex -space-x-1">
            <div className="h-3 w-3 rounded-full bg-primary-100 ring-1 ring-white" />
            <div className="h-3 w-3 rounded-full bg-neutral-200 ring-1 ring-white" />
          </div>
          <div className="h-1.5 w-8 rounded bg-primary-100" />
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          6. Bottom Right Gantt / Timeline Mockup Board
          --------------------------------------------------------------------- */}
      <div className="absolute bottom-20 right-6 hidden w-[360px] rounded-2xl border border-neutral-200 bg-[#EDF2F7] p-3.5 shadow-xl xl:block 2xl:right-16 2xl:w-[400px]">
        {/* Topbar */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
          <div className="h-3 w-3 rounded-full bg-[#4338CA]" />
          <div className="h-2.5 w-24 rounded bg-neutral-400" />
          <div className="h-2 w-10 rounded bg-neutral-400" />
        </div>

        {/* Timeline Content */}
        <div className="mt-3 flex">
          {/* Row Headers */}
          <div className="w-20 shrink-0 space-y-5 pt-1.5">
            <div className="h-2 w-12 rounded bg-neutral-500" />
            <div className="h-2 w-14 rounded bg-neutral-500" />
            <div className="h-2 w-10 rounded bg-neutral-500" />
            <div className="h-2 w-12 rounded bg-neutral-500" />
          </div>

          {/* Timeline Bars */}
          <div className="relative flex-1 space-y-3.5 pt-0.5">
            {/* Bar 1 */}
            <div className="flex h-5 w-28 items-center justify-between rounded bg-[#3730A3] px-2 shadow-xs">
              <div className="h-1 w-12 rounded bg-white/70" />
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>

            {/* Bar 2 */}
            <div className="ml-12 h-5 w-32 rounded bg-[#4F46E5] px-2 py-1.5 shadow-xs">
              <div className="h-1 w-16 rounded bg-white/70" />
            </div>

            {/* Connecting line 1 */}
            <div className="absolute top-10 left-28 h-7 w-px bg-neutral-300" />

            {/* Bar 3 */}
            <div className="ml-8 h-5 w-24 rounded bg-success-500 px-2 py-1.5 shadow-xs">
              <div className="h-1 w-12 rounded bg-white/70" />
            </div>

            {/* Connecting line 2 */}
            <div className="absolute top-19 left-40 h-7 w-px bg-neutral-300" />

            {/* Bar 4 */}
            <div className="ml-24 h-5 w-20 rounded bg-warning-500 px-2 py-1.5 shadow-xs">
              <div className="h-1 w-10 rounded bg-white/70" />
            </div>
          </div>
        </div>

        {/* Bottom Check Circle */}
        <div className="mt-2 flex justify-end">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-semibold text-[#4338CA]">
            ✓
          </div>
        </div>
      </div>
    </div>
  );
};
