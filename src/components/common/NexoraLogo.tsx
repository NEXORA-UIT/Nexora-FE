import * as React from "react";
import { cn } from "@/lib/utils";
import type { NexoraLogoProps } from "@/types";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  className,
  showSubtitle = true,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-9 w-9",
    md: "h-12 w-12",
    lg: "h-14 w-14",
  };

  return (
    <div className={cn("flex flex-col items-center text-center select-none", className)}>
      {/* Official Nexora App Logo from assets/logo/logo.png */}
      <img
        src={nexoraLogoSrc}
        alt="Nexora Logo"
        className={cn("rounded-2xl object-contain shadow-xs", sizeClasses[size])}
      />

      {/* Brand Title */}
      <span className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
        Nexora
      </span>

      {/* Brand Tagline */}
      {showSubtitle && (
        <span className="mt-0.5 text-xs text-neutral-500">
          Intelligent Project Workspace
        </span>
      )}
    </div>
  );
};
