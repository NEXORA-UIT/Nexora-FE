import { apiClient } from "@/apis/client";
import { mapWorkspaceDtoToDomain } from "@/mappers/workspace.mapper";
import type {
  Workspace,
  WorkspaceDto,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspacePaginationMeta,
  ApiSuccessResponse,
} from "@/types";

export interface ListWorkspacesResponse {
  items: Workspace[];
  meta?: WorkspacePaginationMeta;
}

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
};
