import * as React from "react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "default" | "error" | "primary";
  isActive?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface WorkspaceOption {
  id: string;
  name: string;
  role?: string;
  isCurrent?: boolean;
}

export interface NavUserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}
