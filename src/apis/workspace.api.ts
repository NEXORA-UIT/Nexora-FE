import { apiClient } from "@/apis/client";
import { mapWorkspaceDtoToDomain } from "@/mappers/workspace.mapper";
import type {
  Workspace,
  WorkspaceDto,
  WorkspaceMemberDto,
  ListWorkspaceMembersResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspacePaginationMeta,
  ApiSuccessResponse,
} from "@/types";

export interface ListWorkspacesResponse {
  items: Workspace[];
  meta?: WorkspacePaginationMeta;
}

import { registerOnClearAuth } from "@/stores/auth.store";

const workspaceMembersCache = new Map<string, { timestamp: number; data: ListWorkspaceMembersResponse }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

export function clearWorkspaceMembersCache(): void {
  workspaceMembersCache.clear();
}

// Auto-register cache cleanup whenever user session is cleared
registerOnClearAuth(clearWorkspaceMembersCache);

export const workspaceApi = {
  /**
   * Retrieves list of all workspaces accessible to the authenticated user
   * GET /api/v1/workspaces
   */
  async listWorkspaces(params?: {
    page?: number;
    limit?: number;
  }): Promise<ListWorkspacesResponse> {
    const response = await apiClient.get<
      ApiSuccessResponse<WorkspaceDto[]> & { meta?: WorkspacePaginationMeta }
    >("/workspaces", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
      },
    });

    const items = (response.data.data || []).map((dto) =>
      mapWorkspaceDtoToDomain(dto)
    );

    return {
      items,
      meta: response.data.meta,
    };
  },

  /**
   * Retrieves workspace details by workspace ID
   * GET /api/v1/workspaces/:id
   */
  async getWorkspace(id: string): Promise<Workspace> {
    const response = await apiClient.get<ApiSuccessResponse<WorkspaceDto>>(
      `/workspaces/${id}`
    );
    return mapWorkspaceDtoToDomain(response.data.data);
  },

  /**
   * Creates a new workspace
   * POST /api/v1/workspaces
   */
  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await apiClient.post<ApiSuccessResponse<WorkspaceDto>>(
      "/workspaces",
      data
    );
    return mapWorkspaceDtoToDomain(response.data.data);
  },

  /**
   * Updates existing workspace metadata (Owner only)
   * PATCH /api/v1/workspaces/:id
   */
  async updateWorkspace(
    id: string,
    data: UpdateWorkspaceRequest
  ): Promise<Workspace> {
    const response = await apiClient.patch<ApiSuccessResponse<WorkspaceDto>>(
      `/workspaces/${id}`,
      data
    );
    return mapWorkspaceDtoToDomain(response.data.data);
  },

  /**
   * Archives a workspace (Owner only)
   * PATCH /api/v1/workspaces/:id/archive
   */
  async archiveWorkspace(id: string): Promise<Workspace> {
    const response = await apiClient.patch<ApiSuccessResponse<WorkspaceDto>>(
      `/workspaces/${id}/archive`
    );
    return mapWorkspaceDtoToDomain(response.data.data);
  },

  /**
   * Unarchives/restores a workspace (Owner only)
   * PATCH /api/v1/workspaces/:id/unarchive
   */
  async unarchiveWorkspace(id: string): Promise<Workspace> {
    const response = await apiClient.patch<ApiSuccessResponse<WorkspaceDto>>(
      `/workspaces/${id}/unarchive`
    );
    return mapWorkspaceDtoToDomain(response.data.data);
  },

  /**
   * Retrieves members of a workspace
   * GET /api/v1/workspaces/:id/members
   */
  async listWorkspaceMembers(
    workspaceId: string,
    params?: { page?: number; limit?: number; bypassCache?: boolean }
  ): Promise<ListWorkspaceMembersResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 100;
    const cacheKey = `${workspaceId}_${page}_${limit}`;

    if (!params?.bypassCache) {
      const cached = workspaceMembersCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }

    const response = await apiClient.get<
      ApiSuccessResponse<WorkspaceMemberDto[]> & { meta?: WorkspacePaginationMeta }
    >(`/workspaces/${workspaceId}/members`, {
      params: { page, limit },
    });

    const result: ListWorkspaceMembersResponse = {
      items: response.data.data || [],
      meta: response.data.meta,
    };

    workspaceMembersCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  },
};

