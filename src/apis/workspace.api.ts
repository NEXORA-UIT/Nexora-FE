import { apiClient } from "@/apis/client";
import { registerOnClearAuth } from "@/stores/auth.store";
import { mapWorkspaceDtoToDomain } from "@/mappers/workspace.mapper";
import type {
  Workspace,
  WorkspaceDto,
  WorkspaceMemberDto,
  ListWorkspacesResponse,
  ListWorkspaceMembersResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspacePaginationMeta,
  ApiSuccessResponse,
  WorkspaceInvitationDto,
  InviteWorkspaceMemberRequest,
  TransferWorkspaceOwnerRequest,
} from "@/types";

export type { ListWorkspacesResponse };

export const MAX_WORKSPACE_MEMBERS_CACHE_ENTRIES = 50;
const workspaceMembersCache = new Map<string, { timestamp: number; data: ListWorkspaceMembersResponse }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL

export function clearWorkspaceMembersCache(): void {
  workspaceMembersCache.clear();
}

export function getWorkspaceMembersCacheSize(): number {
  return workspaceMembersCache.size;
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
      if (cached) {
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
          // Touch-on-read: re-insert into Map to move to newest position in LRU order
          workspaceMembersCache.delete(cacheKey);
          workspaceMembersCache.set(cacheKey, cached);
          return cached.data;
        }
        // Entry expired: evict stale entry
        workspaceMembersCache.delete(cacheKey);
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

    // If key already exists, delete first to move to newest position
    if (workspaceMembersCache.has(cacheKey)) {
      workspaceMembersCache.delete(cacheKey);
    } else if (workspaceMembersCache.size >= MAX_WORKSPACE_MEMBERS_CACHE_ENTRIES) {
      // Evict least-recently-used entry (first key in Map)
      const oldestKey = workspaceMembersCache.keys().next().value;
      if (oldestKey !== undefined) {
        workspaceMembersCache.delete(oldestKey);
      }
    }

    workspaceMembersCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  },

  async inviteWorkspaceMember(
    workspaceId: string,
    payload: InviteWorkspaceMemberRequest
  ): Promise<WorkspaceInvitationDto> {
    const response = await apiClient.post<ApiSuccessResponse<WorkspaceInvitationDto>>(
      `/workspaces/${workspaceId}/invitations`,
      payload
    );
    return response.data.data;
  },

  async listWorkspaceInvitations(workspaceId: string): Promise<WorkspaceInvitationDto[]> {
    const response = await apiClient.get<ApiSuccessResponse<WorkspaceInvitationDto[]>>(
      `/workspaces/${workspaceId}/invitations`
    );
    return response.data.data || [];
  },

  async cancelWorkspaceInvitation(
    workspaceId: string,
    invitationId: string
  ): Promise<WorkspaceInvitationDto> {
    const response = await apiClient.delete<ApiSuccessResponse<WorkspaceInvitationDto>>(
      `/workspaces/${workspaceId}/invitations/${invitationId}`
    );
    return response.data.data;
  },

  async resendWorkspaceInvitation(invitationId: string): Promise<WorkspaceInvitationDto> {
    const response = await apiClient.post<ApiSuccessResponse<WorkspaceInvitationDto>>(
      `/workspaces/invitations/${invitationId}/resend`
    );
    return response.data.data;
  },

  async acceptWorkspaceInvitation(token: string): Promise<WorkspaceInvitationDto> {
    const response = await apiClient.post<ApiSuccessResponse<WorkspaceInvitationDto>>(
      `/workspaces/invitations/${encodeURIComponent(token)}/accept`
    );
    clearWorkspaceMembersCache();
    return response.data.data;
  },

  async rejectWorkspaceInvitation(token: string): Promise<WorkspaceInvitationDto> {
    const response = await apiClient.post<ApiSuccessResponse<WorkspaceInvitationDto>>(
      `/workspaces/invitations/${encodeURIComponent(token)}/reject`
    );
    return response.data.data;
  },

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/workspaces/${workspaceId}/members/${userId}`
    );
    clearWorkspaceMembersCache();
  },

  async transferWorkspaceOwner(
    workspaceId: string,
    userId: string,
    payload: TransferWorkspaceOwnerRequest = { role: "OWNER" }
  ): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/workspaces/${workspaceId}/members/${userId}`,
      payload
    );
    clearWorkspaceMembersCache();
  },
};

