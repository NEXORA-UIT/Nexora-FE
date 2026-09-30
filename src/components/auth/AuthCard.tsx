import * as React from "react";
import { cn } from "@/lib/utils";

import type { AuthCardProps } from "@/types";

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "w-full max-w-[440px] rounded-2xl border border-neutral-200/90 bg-white p-7 shadow-2xl sm:p-9",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
