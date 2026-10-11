import { describe, it, expect, vi, beforeEach } from "vitest";
import { workspaceApi, clearWorkspaceMembersCache } from "../workspace.api";
import { apiClient, ApiError } from "../client";
import { useAuthStore, registerOnClearAuth } from "@/stores/auth.store";
import { authApi } from "../auth.api";
import type { WorkspaceDto, WorkspaceMemberDto } from "@/types";

describe("workspaceApi Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearWorkspaceMembersCache();
  });

  const mockWorkspaceDto: WorkspaceDto = {
    id: "ws-uuid-1",
    name: "Engineering Core",
    description: "Core platform development workspace",
    domainCategory: "SOFTWARE",
    isFrozen: false,
    archivedAt: null,
    createdAt: "2026-10-09T00:00:00.000Z",
    updatedAt: "2026-10-09T00:00:00.000Z",
  };

  describe("workspaceApi.listWorkspaces", () => {
    it("requests GET /workspaces with pagination and maps response items", async () => {
      const mockEnvelope = {
        data: {
          success: true,
          data: [mockWorkspaceDto],
          meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockEnvelope);

      const result = await workspaceApi.listWorkspaces({ page: 1, limit: 50 });

      expect(apiClient.get).toHaveBeenCalledWith("/workspaces", {
        params: { page: 1, limit: 50 },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe("ws-uuid-1");
      expect(result.items[0].name).toBe("Engineering Core");
      expect(result.items[0].status).toBe("active");
      expect(result.items[0].memberCount).toBeUndefined();
      expect(result.meta).toEqual(mockEnvelope.data.meta);
    });

    it("handles empty data gracefully", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { success: true, data: [] },
      });

      const result = await workspaceApi.listWorkspaces();
      expect(result.items).toEqual([]);
    });
  });

  describe("workspaceApi.getWorkspace", () => {
    it("requests GET /workspaces/:id and returns mapped domain model", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { success: true, data: mockWorkspaceDto },
      });

      const result = await workspaceApi.getWorkspace("ws-uuid-1");

      expect(apiClient.get).toHaveBeenCalledWith("/workspaces/ws-uuid-1");
      expect(result.id).toBe("ws-uuid-1");
      expect(result.teamType).toBe("Software Engineering");
    });
  });

  describe("workspaceApi.createWorkspace", () => {
    it("sends POST /workspaces with payload and returns created workspace", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: mockWorkspaceDto },
      });

      const payload = {
        name: "Engineering Core",
        description: "Core platform development workspace",
        domainCategory: "SOFTWARE" as const,
      };

      const result = await workspaceApi.createWorkspace(payload);

      expect(apiClient.post).toHaveBeenCalledWith("/workspaces", payload);
      expect(result.id).toBe("ws-uuid-1");
      expect(result.status).toBe("active");
    });
  });

  describe("workspaceApi.updateWorkspace", () => {
    it("sends PATCH /workspaces/:id with update fields", async () => {
      const updatedDto = { ...mockWorkspaceDto, name: "Engineering Core Updated" };
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { success: true, data: updatedDto },
      });

      const result = await workspaceApi.updateWorkspace("ws-uuid-1", {
        name: "Engineering Core Updated",
      });

      expect(apiClient.patch).toHaveBeenCalledWith("/workspaces/ws-uuid-1", {
        name: "Engineering Core Updated",
      });
      expect(result.name).toBe("Engineering Core Updated");
    });
  });

  describe("workspaceApi.archiveWorkspace", () => {
    it("sends PATCH /workspaces/:id/archive and maps archived status", async () => {
      const archivedDto: WorkspaceDto = {
        ...mockWorkspaceDto,
        archivedAt: "2026-10-09T12:00:00.000Z",
      };

      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { success: true, data: archivedDto },
      });

      const result = await workspaceApi.archiveWorkspace("ws-uuid-1");

      expect(apiClient.patch).toHaveBeenCalledWith("/workspaces/ws-uuid-1/archive");
      expect(result.status).toBe("archived");
    });
  });

  describe("workspaceApi.unarchiveWorkspace", () => {
    it("sends PATCH /workspaces/:id/unarchive and maps active status", async () => {
      const unarchivedDto: WorkspaceDto = {
        ...mockWorkspaceDto,
        archivedAt: null,
      };

      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
        data: { success: true, data: unarchivedDto },
      });

      const result = await workspaceApi.unarchiveWorkspace("ws-uuid-1");

      // Validates endpoint is specifically /unarchive (NOT /restore)
      expect(apiClient.patch).toHaveBeenCalledWith("/workspaces/ws-uuid-1/unarchive");
      expect(result.status).toBe("active");
    });
  });

  describe("workspaceApi.listWorkspaceMembers", () => {
    const mockMember: WorkspaceMemberDto = {
      id: "membership-1",
      workspaceId: "ws-uuid-1",
      userId: "user-owner-1",
      role: "OWNER",
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
      endedAt: null,
      user: {
        id: "user-owner-1",
        email: "owner@nexora.app",
        fullName: "Workspace Owner",
        status: "ACTIVE",
      },
    };

    it("requests GET /workspaces/:id/members with pagination and caches response", async () => {
      const mockEnvelope = {
        data: {
          success: true,
          data: [mockMember],
          meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValueOnce(mockEnvelope);

      const result = await workspaceApi.listWorkspaceMembers("ws-uuid-1");

      expect(apiClient.get).toHaveBeenCalledWith("/workspaces/ws-uuid-1/members", {
        params: { page: 1, limit: 100 },
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].role).toBe("OWNER");
      expect(result.items[0].userId).toBe("user-owner-1");

      // Verify second call within TTL uses in-memory cache without hitting apiClient.get
      const cachedResult = await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(cachedResult.items).toEqual(result.items);
    });

    it("bypasses cache when bypassCache is true", async () => {
      const mockEnvelope = {
        data: {
          success: true,
          data: [mockMember],
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValue(mockEnvelope);

      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      await workspaceApi.listWorkspaceMembers("ws-uuid-1", { bypassCache: true });

      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });

    it("clears cache and refetches fresh data when useAuthStore.clearAuth() is called", async () => {
      const mockEnvelope = {
        data: {
          success: true,
          data: [mockMember],
          meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValue(mockEnvelope);

      // Initial fetch populates cache
      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Cached call does not trigger apiClient.get
      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Trigger clearAuth (logout lifecycle)
      useAuthStore.getState().clearAuth();

      // Subsequent call must fetch fresh data from network
      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });

    it("clears cache and refetches fresh data when authApi.logout() is invoked", async () => {
      const mockEnvelope = {
        data: {
          success: true,
          data: [mockMember],
          meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValue(mockEnvelope);
      vi.spyOn(apiClient, "post").mockResolvedValue({
        data: { success: true, data: {} },
      });

      // Populate cache
      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Call authApi.logout()
      await authApi.logout();

      // Subsequent call must fetch fresh data from network
      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });

    it("clears cache and refetches fresh data when authApi.logoutAll() is invoked", async () => {
      const mockEnvelope = {
        data: {
          success: true,
          data: [mockMember],
          meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      };

      vi.spyOn(apiClient, "get").mockResolvedValue(mockEnvelope);
      vi.spyOn(apiClient, "post").mockResolvedValue({
        data: { success: true, data: {} },
      });

      // Populate cache
      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Call authApi.logoutAll()
      await authApi.logoutAll();

      // Subsequent call must fetch fresh data from network
      await workspaceApi.listWorkspaceMembers("ws-uuid-1");
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });

    it("propagates API rejection when authApi.logout() fails on server", async () => {
      const networkError = new ApiError("Network Error during logout", "NETWORK_ERROR", 500);
      vi.spyOn(apiClient, "post").mockRejectedValueOnce(networkError);

      await expect(authApi.logout()).rejects.toThrow(networkError);
    });

    it("maintains unique callbacks in registerOnClearAuth without duplicate accumulation", () => {
      let callCount = 0;
      const testCleanup = () => {
        callCount += 1;
      };

      // Register same callback twice
      const unregister1 = registerOnClearAuth(testCleanup);
      const unregister2 = registerOnClearAuth(testCleanup);

      useAuthStore.getState().clearAuth();

      // Because Set stores unique references, it must be called exactly once
      expect(callCount).toBe(1);

      unregister1();
      unregister2();
    });

    it("ensures clearAuth succeeds even if a registered callback throws an error", () => {
      const faultyCleanup = () => {
        throw new Error("Cleanup crash");
      };

      const unregister = registerOnClearAuth(faultyCleanup);

      // Must not throw exception
      expect(() => {
        useAuthStore.getState().clearAuth();
      }).not.toThrow();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      unregister();
    });
  });

  describe("Error Propagation", () => {
    it("re-throws ApiError without falling back to mock data", async () => {
      const apiError = new ApiError("Only owner can archive", "FORBIDDEN", 403);
      vi.spyOn(apiClient, "patch").mockRejectedValueOnce(apiError);

      await expect(workspaceApi.archiveWorkspace("ws-uuid-1")).rejects.toThrow(apiError);
    });
  });
});

