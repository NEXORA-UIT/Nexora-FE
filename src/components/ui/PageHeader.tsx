import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}

export const PageHeader = ({
  title,
  description,
  actions,
  eyebrow,
}: PageHeaderProps) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow ? (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-600">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-600">
          {description}
        </p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        {actions}
      </div>
    ) : null}
  </header>
);
