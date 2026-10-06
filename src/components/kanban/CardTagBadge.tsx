import * as React from "react";

export interface CardTagBadgeProps {
  label: string;
}

export const CardTagBadge: React.FC<CardTagBadgeProps> = ({ label }) => {
  return (
    <span className="inline-flex items-center rounded-md border border-neutral-200/80 bg-neutral-100/80 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
      {label}
    </span>
  );
};
