import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { BadgeProps } from "@/types";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-50 text-primary-700 border border-primary-200",
        secondary:
          "bg-neutral-100 text-neutral-700 border border-neutral-200",
        outline:
          "bg-transparent text-neutral-700 border border-neutral-300",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
        error:
          "bg-red-50 text-red-700 border border-red-200",
        info:
          "bg-sky-50 text-sky-700 border border-sky-200",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  }
);

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  ...props
}) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
};
