import * as React from "react";
import { cn } from "@/lib/utils";
import type { AuthStepIndicatorProps } from "@/types";

export const AuthStepIndicator: React.FC<AuthStepIndicatorProps> = ({
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "mb-4 inline-flex items-center rounded-xl bg-neutral-100 p-1 text-xs select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => currentStep === "sent" && onStepClick?.("form")}
        className={cn(
          "rounded-lg px-3 py-1 font-medium transition-all",
          currentStep === "form"
            ? "bg-white text-neutral-900 shadow-xs font-semibold"
            : "text-neutral-500 hover:text-neutral-800"
        )}
      >
        1. Enter email
      </button>
      <div
        className={cn(
          "rounded-lg px-3 py-1 font-medium transition-all",
          currentStep === "sending"
            ? "bg-white text-neutral-900 shadow-xs font-semibold"
            : "text-neutral-400"
        )}
      >
        2. Sending...
      </div>
      <div
        className={cn(
          "rounded-lg px-3 py-1 font-medium transition-all",
          currentStep === "sent"
            ? "bg-white text-neutral-900 shadow-xs font-semibold"
            : "text-neutral-400"
        )}
      >
        3. Check email
      </div>
    </div>
  );
};
