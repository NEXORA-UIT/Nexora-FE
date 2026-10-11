import * as React from "react";

export interface CardTagBadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export const CardTagBadge: React.FC<CardTagBadgeProps> = ({
  label,
  color,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-neutral-200/80 bg-neutral-100/80 px-2 py-0.5 text-[11px] font-medium text-neutral-600 ${className}`}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
