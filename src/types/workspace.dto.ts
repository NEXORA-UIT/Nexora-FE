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

export interface WorkspacePaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
