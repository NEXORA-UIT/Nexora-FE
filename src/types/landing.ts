import * as React from "react";

export interface LandingPillarItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface LandingFeatureSection {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  reversed?: boolean;
}

export interface MockBoardCard {
  id: string;
  title: string;
  tag: string;
  tagColorClass: string;
  priority: "high" | "medium" | "low";
  dueText: string;
  assigneeInitials: string;
  assigneeBgClass: string;
}

export interface MockBoardColumn {
  id: string;
  title: string;
  count: number;
  indicatorClass: string;
  cards: MockBoardCard[];
}

export type LandingTeamRole = "software" | "product" | "architecture" | "design";

export interface TeamBoardData {
  role: LandingTeamRole;
  label: string;
  sprintName: string;
  activeTasks: number;
  columns: MockBoardColumn[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  badgeBg: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
}
