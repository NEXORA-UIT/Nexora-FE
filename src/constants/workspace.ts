import type { WorkspaceDomainCategory } from "@/types";

/**
 * Human-readable display labels for workspace domain categories.
 */
export const DOMAIN_CATEGORY_LABELS: Record<WorkspaceDomainCategory, string> = {
  SOFTWARE: "Software Engineering",
  EDUCATION: "Education",
  RESEARCH_ACADEMIC: "Research & Academic",
  MARKETING: "Marketing",
  EVENT: "Event Management",
  INTERNAL_OPERATIONS: "Internal Operations",
  OTHER: "General",
};

/**
 * Options list for workspace creation modal dropdown selector.
 * Preserves "Other / General" phrasing for the modal creation context.
 */
export const DOMAIN_CATEGORY_OPTIONS: Array<{
  value: WorkspaceDomainCategory;
  label: string;
}> = [
  { value: "SOFTWARE", label: DOMAIN_CATEGORY_LABELS.SOFTWARE },
  { value: "EDUCATION", label: DOMAIN_CATEGORY_LABELS.EDUCATION },
  { value: "RESEARCH_ACADEMIC", label: DOMAIN_CATEGORY_LABELS.RESEARCH_ACADEMIC },
  { value: "MARKETING", label: DOMAIN_CATEGORY_LABELS.MARKETING },
  { value: "EVENT", label: DOMAIN_CATEGORY_LABELS.EVENT },
  { value: "INTERNAL_OPERATIONS", label: DOMAIN_CATEGORY_LABELS.INTERNAL_OPERATIONS },
  { value: "OTHER", label: "Other / General" },
];
