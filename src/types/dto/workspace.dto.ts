import type { PaginationMeta } from "../api";

export type WorkspaceDomainCategory =
  | "SOFTWARE"
  | "EDUCATION"
  | "RESEARCH_ACADEMIC"
  | "MARKETING"
  | "EVENT"
  | "INTERNAL_OPERATIONS"
  | "OTHER";

export interface WorkspaceDto {
  id: string;
  name: string;
  description: string | null;
  domainCategory: WorkspaceDomainCategory | null;
  isFrozen: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  domainCategory?: WorkspaceDomainCategory;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  domainCategory?: WorkspaceDomainCategory;
}

/**
 * Pagination metadata for Workspace endpoints.
 * Aliases shared PaginationMeta for domain consistency and backward compatibility.
 */
export type WorkspacePaginationMeta = PaginationMeta;

export type WorkspaceRole = "OWNER" | "MEMBER";

export interface WorkspaceMemberUserDto {
  id: string;
  email: string;
  fullName: string;
  status: string;
}

export interface WorkspaceMemberDto {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
  user: WorkspaceMemberUserDto;
}

export interface ListWorkspaceMembersResponse {
  items: WorkspaceMemberDto[];
  meta?: WorkspacePaginationMeta;
}

export type WorkspaceInvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELED";

export interface WorkspaceInvitationDto {
  id: string;
  workspaceId: string;
  email: string;
  status: WorkspaceInvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface InviteWorkspaceMemberRequest {
  email: string;
}

export interface TransferWorkspaceOwnerRequest {
  role: "OWNER";
}
