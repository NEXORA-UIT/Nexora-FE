import * as React from "react";

export interface NexoraLogoProps {
  className?: string;
  showSubtitle?: boolean;
  size?: "sm" | "md" | "lg";
}

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export interface UseCountdownReturn {
  secondsLeft: number;
  isActive: boolean;
  start: (seconds: number) => void;
  reset: () => void;
}
