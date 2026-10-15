import type {
  Workspace,
  WorkspaceDto,
  WorkspaceDomainCategory,
  WorkspaceStatus,
} from "@/types";
import { DOMAIN_CATEGORY_LABELS } from "@/constants/workspace";

export { DOMAIN_CATEGORY_LABELS };

/**
 * Converts a domainCategory enum from the backend to a human-readable teamType string
 */
export function domainCategoryToTeamType(
  category: WorkspaceDomainCategory | null | undefined
): string {
  if (!category) return "General";
  return DOMAIN_CATEGORY_LABELS[category] || "General";
}

/**
 * Derives a 2-character initials string from workspace name
 */
export function generateWorkspaceInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  if (words.length === 1 && words[0].length === 1) {
    return words[0].toUpperCase();
  }
  return "WS";
}

/**
 * Generates a clean URL slug from workspace name
 */
export function generateWorkspaceSlug(name: string, fallbackId: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || fallbackId;
}

/**
 * Determines workspace status from backend DTO flags
 */
export function deriveWorkspaceStatus(dto: WorkspaceDto): WorkspaceStatus {
  if (dto.archivedAt) return "archived";
  if (dto.isFrozen) return "paused";
  return "active";
}

export interface WorkspaceMappingOverrides {
  memberCount?: number;
  activeBoardCount?: number;
}

/**
 * Pure mapping function converting Backend WorkspaceDto to Frontend Workspace domain model
 */
export function mapWorkspaceDtoToDomain(
  dto: WorkspaceDto,
  overrides?: WorkspaceMappingOverrides
): Workspace {
  return {
    id: dto.id,
    name: dto.name,
    slug: generateWorkspaceSlug(dto.name, dto.id),
    status: deriveWorkspaceStatus(dto),
    description: dto.description ?? "",
    teamType: domainCategoryToTeamType(dto.domainCategory),
    initials: generateWorkspaceInitials(dto.name),
    memberCount: overrides?.memberCount,
    activeBoardCount: overrides?.activeBoardCount,
    isFrozen: dto.isFrozen,
  };
}
