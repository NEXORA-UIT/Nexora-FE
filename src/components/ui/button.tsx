import * as React from "react";
import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ButtonProps } from "@/types";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-neutral-200 disabled:text-neutral-400 shadow-sm",
        secondary:
          "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400",
        outline:
          "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 disabled:bg-white disabled:text-neutral-300 disabled:border-neutral-200 shadow-sm",
        ghost:
          "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-300",
        destructive:
          "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 disabled:bg-neutral-200 disabled:text-neutral-400 shadow-sm",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-11 px-5 text-base rounded-md",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
