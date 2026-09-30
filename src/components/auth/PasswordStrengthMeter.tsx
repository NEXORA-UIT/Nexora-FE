import * as React from "react";
import { cn } from "@/lib/utils";
import { evaluatePasswordStrength } from "@/utils/password";
import type { PasswordStrengthMeterProps } from "@/types";

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  strength: controlledStrength,
  password,
  className,
}) => {
  const strength =
    controlledStrength ??
    (password !== undefined ? evaluatePasswordStrength(password) : undefined);

  if (!strength) return null;

  return (
    <div className={cn("pt-0.5", className)}>
      {/* 3-Segment visual progress bars */}
      <div className="grid grid-cols-3 gap-1.5">
        <div
          className={cn(
            "h-1 rounded-full transition-colors",
            strength.segmentsFilled >= 1 ? "bg-error-500" : "bg-neutral-200"
          )}
        />
        <div
          className={cn(
            "h-1 rounded-full transition-colors",
            strength.segmentsFilled >= 2 ? "bg-primary-500" : "bg-neutral-200"
          )}
        />
        <div
          className={cn(
            "h-1 rounded-full transition-colors",
            strength.segmentsFilled >= 3 ? "bg-success-500" : "bg-neutral-200"
          )}
        />
      </div>

      {/* Strength label and validation requirement hint */}
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-neutral-500">
          Strength:{" "}
          <span
            className={cn(
              "font-medium",
              strength.label ? "text-primary-600" : "text-neutral-400"
            )}
          >
            {strength.label || "Empty"}
          </span>
        </span>
        <span className="text-[11px] text-neutral-400">
          8+ characters, uppercase & number
        </span>
      </div>
    </div>
  );
};
