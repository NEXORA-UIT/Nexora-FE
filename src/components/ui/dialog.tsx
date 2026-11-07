import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const DialogRoot = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  size?: "sm" | "md" | "lg" | "drawer";
};

const contentSizes: Record<NonNullable<DialogContentProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  drawer:
    "inset-y-0 right-0 h-[100dvh] max-h-[100dvh] max-w-full rounded-none border-y-0 border-r-0 sm:max-w-xl sm:rounded-l-2xl lg:max-w-2xl",
};

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = "md", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-neutral-950/45 backdrop-blur-[2px] motion-reduce:animate-none" />
    <DialogPrimitive.Content
      ref={ref}
      data-size={size}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 z-50 flex max-h-[min(90dvh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-2xl outline-none motion-reduce:animate-none",
        contentSizes[size],
        size === "drawer"
          ? "left-auto top-0 h-[100dvh] max-h-[100dvh] w-full translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 sm:rounded-l-2xl"
          : "max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:max-h-[90dvh] max-sm:pb-[env(safe-area-inset-bottom)]",
        className
      )}
      {...props}
    >
      {size !== "drawer" && (
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-neutral-300 sm:hidden" />
      )}
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        "flex shrink-0 items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4 sm:px-6",
        className
      )}
      {...props}
    />
  )
);
DialogHeader.displayName = "DialogHeader";

export const DialogBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6", className)}
      {...props}
    />
  )
);
DialogBody.displayName = "DialogBody";

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 sm:px-6",
        className
      )}
      {...props}
    />
  )
);
DialogFooter.displayName = "DialogFooter";
