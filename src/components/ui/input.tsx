import * as React from "react";
import { cn } from "@/lib/utils";
import type { InputProps } from "@/types";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, actionSlot, isRequired, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || (label ? `${label.toLowerCase().replace(/\s+/g, "-")}-${generatedId}` : generatedId);
    const required = isRequired || props.required;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-neutral-700 select-none"
          >
            {label}
            {required && (
              <span className="ml-1 text-error-500 font-semibold" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400",
              "transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400",
              actionSlot && "pr-10",
              error && "border-error-500 focus:border-error-500 focus:ring-error-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {actionSlot && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
              {actionSlot}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error-500">{error}</p>}
        {!error && helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
