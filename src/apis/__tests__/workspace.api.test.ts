import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  workspaceApi,
  clearWorkspaceMembersCache,
  getWorkspaceMembersCacheSize,
  MAX_WORKSPACE_MEMBERS_CACHE_ENTRIES,
} from "../workspace.api";
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

    it("bounds cache to MAX_WORKSPACE_MEMBERS_CACHE_ENTRIES (50) and evicts oldest entry", async () => {
      expect(MAX_WORKSPACE_MEMBERS_CACHE_ENTRIES).toBe(50);

      vi.spyOn(apiClient, "get").mockImplementation((url) => {
        return Promise.resolve({
          data: {
            success: true,
            data: [{ ...mockMember, workspaceId: url.split("/")[2] }],
          },
        });
      });

      // Populate 50 entries
      for (let i = 0; i < 50; i++) {
        await workspaceApi.listWorkspaceMembers(`ws-bulk-${i}`);
      }

      expect(getWorkspaceMembersCacheSize()).toBe(50);
      expect(apiClient.get).toHaveBeenCalledTimes(50);

      // Accessing ws-bulk-0 without network call
      await workspaceApi.listWorkspaceMembers("ws-bulk-0");
      expect(apiClient.get).toHaveBeenCalledTimes(50);

      // Add 51st entry, which should evict the oldest entry
      await workspaceApi.listWorkspaceMembers("ws-bulk-50");
      expect(getWorkspaceMembersCacheSize()).toBe(50);
      expect(apiClient.get).toHaveBeenCalledTimes(51);
    });

    it("refreshes LRU position on access so accessed entry is not evicted next", async () => {
      vi.spyOn(apiClient, "get").mockImplementation((url) => {
        return Promise.resolve({
          data: {
            success: true,
            data: [{ ...mockMember, workspaceId: url.split("/")[2] }],
          },
        });
      });

      // Populate 50 entries (ws-bulk-0 is the first/oldest inserted)
      for (let i = 0; i < 50; i++) {
        await workspaceApi.listWorkspaceMembers(`ws-bulk-${i}`);
      }

      // Access ws-bulk-0 to touch it and move it to the newest position in LRU
      await workspaceApi.listWorkspaceMembers("ws-bulk-0");
      expect(apiClient.get).toHaveBeenCalledTimes(50);

      // Add ws-bulk-50 (51st unique key). The oldest entry should now be ws-bulk-1, NOT ws-bulk-0!
      await workspaceApi.listWorkspaceMembers("ws-bulk-50");
      expect(apiClient.get).toHaveBeenCalledTimes(51);

      // ws-bulk-0 should still be cached (no network hit)
      await workspaceApi.listWorkspaceMembers("ws-bulk-0");
      expect(apiClient.get).toHaveBeenCalledTimes(51);

      // ws-bulk-1 was evicted, so accessing it MUST trigger a network call
      await workspaceApi.listWorkspaceMembers("ws-bulk-1");
      expect(apiClient.get).toHaveBeenCalledTimes(52);
    });

    it("evicts expired entry after TTL (60s) has elapsed", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({
        data: {
          success: true,
          data: [mockMember],
        },
      });

      const initialTime = 1_000_000;
      const dateSpy = vi.spyOn(Date, "now").mockReturnValue(initialTime);

      // Initial fetch caches response at initialTime
      await workspaceApi.listWorkspaceMembers("ws-ttl-1");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Read within 59 seconds hits cache
      dateSpy.mockReturnValue(initialTime + 59 * 1000);
      await workspaceApi.listWorkspaceMembers("ws-ttl-1");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Read at 61 seconds (past 60s TTL) evicts and fetches fresh
      dateSpy.mockReturnValue(initialTime + 61 * 1000);
      await workspaceApi.listWorkspaceMembers("ws-ttl-1");
      expect(apiClient.get).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });

    it("ensures repeated cache hits do not extend TTL beyond original 60s window", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValue({
        data: {
          success: true,
          data: [mockMember],
        },
      });

      const initialTime = 2_000_000;
      const dateSpy = vi.spyOn(Date, "now").mockReturnValue(initialTime);

      // Initial fetch at t = 0
      await workspaceApi.listWorkspaceMembers("ws-ttl-extend");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Multiple cache hits during TTL window
      dateSpy.mockReturnValue(initialTime + 20 * 1000); // t = 20s
      await workspaceApi.listWorkspaceMembers("ws-ttl-extend");

      dateSpy.mockReturnValue(initialTime + 40 * 1000); // t = 40s
      await workspaceApi.listWorkspaceMembers("ws-ttl-extend");

      dateSpy.mockReturnValue(initialTime + 55 * 1000); // t = 55s
      await workspaceApi.listWorkspaceMembers("ws-ttl-extend");
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // At t = 62s (only 7s after last touch, but > 60s after insertion), cache MUST expire
      dateSpy.mockReturnValue(initialTime + 62 * 1000);
      await workspaceApi.listWorkspaceMembers("ws-ttl-extend");
      expect(apiClient.get).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });
  });

  describe("workspace membership and invitations", () => {
    const invitation = {
      id: "invitation-1",
      workspaceId: "ws-uuid-1",
      email: "member@example.com",
      status: "PENDING" as const,
      expiresAt: "2026-10-16T00:00:00.000Z",
      createdAt: "2026-10-09T00:00:00.000Z",
    };

    it("invites a workspace member using the documented email request", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValueOnce({
        data: { success: true, data: invitation },
      });

      await expect(
        workspaceApi.inviteWorkspaceMember("ws-uuid-1", { email: invitation.email })
      ).resolves.toEqual(invitation);
      expect(apiClient.post).toHaveBeenCalledWith(
        "/workspaces/ws-uuid-1/invitations",
        { email: invitation.email }
      );
    });

    it("lists and cancels workspace invitations using their documented routes", async () => {
      vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        data: { success: true, data: [invitation] },
      });
      vi.spyOn(apiClient, "delete").mockResolvedValueOnce({
        data: { success: true, data: { ...invitation, status: "CANCELED" } },
      });

      await expect(workspaceApi.listWorkspaceInvitations("ws-uuid-1")).resolves.toEqual([invitation]);
      await workspaceApi.cancelWorkspaceInvitation("ws-uuid-1", "invitation-1");
      expect(apiClient.get).toHaveBeenCalledWith("/workspaces/ws-uuid-1/invitations");
      expect(apiClient.delete).toHaveBeenCalledWith(
        "/workspaces/ws-uuid-1/invitations/invitation-1"
      );
    });

    it("accepts and rejects an invitation with the supplied token encoded in the route", async () => {
      vi.spyOn(apiClient, "post").mockResolvedValue({
        data: { success: true, data: invitation },
      });

      await workspaceApi.acceptWorkspaceInvitation("token/with spaces");
      await workspaceApi.rejectWorkspaceInvitation("token/with spaces");
      expect(apiClient.post).toHaveBeenNthCalledWith(
        1,
        "/workspaces/invitations/token%2Fwith%20spaces/accept"
      );
      expect(apiClient.post).toHaveBeenNthCalledWith(
        2,
        "/workspaces/invitations/token%2Fwith%20spaces/reject"
      );
    });

    it("removes a member and transfers ownership with the documented payload", async () => {
      vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: { success: true, data: {} } });
      vi.spyOn(apiClient, "patch").mockResolvedValueOnce({ data: { success: true, data: {} } });

      await workspaceApi.removeWorkspaceMember("ws-uuid-1", "user-2");
      await workspaceApi.transferWorkspaceOwner("ws-uuid-1", "user-2");
      expect(apiClient.delete).toHaveBeenCalledWith("/workspaces/ws-uuid-1/members/user-2");
      expect(apiClient.patch).toHaveBeenCalledWith(
        "/workspaces/ws-uuid-1/members/user-2",
        { role: "OWNER" }
      );
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

