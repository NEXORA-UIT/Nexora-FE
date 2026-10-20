import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useWorkspaceStore,
  ACTIVE_WORKSPACE_STORAGE_KEY,
} from "../workspace.store";
import { workspaceApi } from "@/apis/workspace.api";
import { ApiError } from "@/apis/client";
import { useAuthStore } from "@/stores/auth.store";
import type { Workspace } from "@/types";

describe("useWorkspaceStore Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useWorkspaceStore.getState().resetWorkspaceState();
  });

  const mockActiveWs: Workspace = {
    id: "ws-1",
    name: "Engineering Active",
    slug: "engineering-active",
    status: "active",
    description: "Active workspace",
    teamType: "Software Engineering",
    initials: "EA",
  };

  const mockArchivedWs: Workspace = {
    id: "ws-2",
    name: "Legacy Project",
    slug: "legacy-project",
    status: "archived",
    description: "Archived workspace",
    teamType: "General",
    initials: "LP",
  };

  describe("Initial State", () => {
    it("starts with empty state and null active selection", () => {
      const state = useWorkspaceStore.getState();
      expect(state.workspaces).toEqual([]);
      expect(state.activeWorkspaceId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.getActiveWorkspace()).toBeNull();
    });
  });

  describe("fetchWorkspaces & Cold Boot Revalidation", () => {
    it("sets activeWorkspaceId to null when user has no workspaces", async () => {
      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [],
      });

      await useWorkspaceStore.getState().fetchWorkspaces();

      const state = useWorkspaceStore.getState();
      expect(state.workspaces).toEqual([]);
      expect(state.activeWorkspaceId).toBeNull();
      expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBeNull();
    });

    it("preserves stored ID when stored workspace is active", async () => {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "ws-1");

      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockArchivedWs, mockActiveWs],
      });

      await useWorkspaceStore.getState().fetchWorkspaces();

      const state = useWorkspaceStore.getState();
      expect(state.activeWorkspaceId).toBe("ws-1");
      expect(state.getActiveWorkspace()?.id).toBe("ws-1");
    });

    it("prefers first active workspace on cold boot when stored ID is archived", async () => {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "ws-2");

      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockArchivedWs, mockActiveWs],
      });

      await useWorkspaceStore.getState().fetchWorkspaces();

      const state = useWorkspaceStore.getState();
      // ws-1 is active, so it takes precedence over stored archived ws-2
      expect(state.activeWorkspaceId).toBe("ws-1");
      expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBe("ws-1");
    });

    it("allows selecting archived workspace when all workspaces are archived", async () => {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "ws-2");

      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockArchivedWs],
      });

      await useWorkspaceStore.getState().fetchWorkspaces();

      const state = useWorkspaceStore.getState();
      expect(state.activeWorkspaceId).toBe("ws-2");
    });

    it("falls back to first active workspace when stored ID does not exist", async () => {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "non-existent-uuid");

      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockArchivedWs, mockActiveWs],
      });

      await useWorkspaceStore.getState().fetchWorkspaces();

      const state = useWorkspaceStore.getState();
      expect(state.activeWorkspaceId).toBe("ws-1");
      expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBe("ws-1");
    });

    it("handles fetch failure gracefully without silent mock fallback", async () => {
      vi.spyOn(workspaceApi, "listWorkspaces").mockRejectedValueOnce(
        new ApiError("Không thể tải workspace", "WORKSPACE_LIST_FAILED", 400)
      );

      await expect(
        useWorkspaceStore.getState().fetchWorkspaces()
      ).rejects.toThrow("Không thể tải workspace");

      const state = useWorkspaceStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to load workspaces. Please try again.");
      expect(state.error).not.toContain("Không thể tải workspace");
      expect(state.workspaces).toEqual([]);
    });

    it("deduplicates concurrent fetch requests", async () => {
      const listSpy = vi
        .spyOn(workspaceApi, "listWorkspaces")
        .mockResolvedValue({ items: [mockActiveWs] });

      const p1 = useWorkspaceStore.getState().fetchWorkspaces();
      const p2 = useWorkspaceStore.getState().fetchWorkspaces();

      await Promise.all([p1, p2]);

      expect(listSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("setActiveWorkspaceId", () => {
    it("updates active ID and localStorage for existing workspace", async () => {
      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockActiveWs, mockArchivedWs],
      });
      await useWorkspaceStore.getState().fetchWorkspaces();

      useWorkspaceStore.getState().setActiveWorkspaceId("ws-2");

      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws-2");
      expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBe("ws-2");
    });

    it("ignores non-existent workspace IDs", async () => {
      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockActiveWs],
      });
      await useWorkspaceStore.getState().fetchWorkspaces();

      useWorkspaceStore.getState().setActiveWorkspaceId("invalid-id");

      expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("ws-1");
    });
  });

  describe("createWorkspace", () => {
    it("prepends created workspace and activates it immediately", async () => {
      const createdWs: Workspace = {
        id: "ws-new",
        name: "New Project",
        slug: "new-project",
        status: "active",
        description: "New ws",
        teamType: "Software Engineering",
        initials: "NP",
      };

      vi.spyOn(workspaceApi, "createWorkspace").mockResolvedValueOnce(createdWs);

      const result = await useWorkspaceStore.getState().createWorkspace({
        name: "New Project",
      });

      expect(result).toEqual(createdWs);
      const state = useWorkspaceStore.getState();
      expect(state.workspaces[0]).toEqual(createdWs);
      expect(state.activeWorkspaceId).toBe("ws-new");
      expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBe("ws-new");
    });
  });

  describe("archiveWorkspace & unarchiveWorkspace", () => {
    it("updates workspace status in store on archive", async () => {
      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockActiveWs],
      });
      await useWorkspaceStore.getState().fetchWorkspaces();

      const archivedWs: Workspace = { ...mockActiveWs, status: "archived" };
      vi.spyOn(workspaceApi, "archiveWorkspace").mockResolvedValueOnce(archivedWs);

      await useWorkspaceStore.getState().archiveWorkspace("ws-1");

      const target = useWorkspaceStore
        .getState()
        .workspaces.find((w) => w.id === "ws-1");
      expect(target?.status).toBe("archived");
    });

    it("updates workspace status in store on unarchive", async () => {
      vi.spyOn(workspaceApi, "listWorkspaces").mockResolvedValueOnce({
        items: [mockArchivedWs],
      });
      await useWorkspaceStore.getState().fetchWorkspaces();

      const restoredWs: Workspace = { ...mockArchivedWs, status: "active" };
      vi.spyOn(workspaceApi, "unarchiveWorkspace").mockResolvedValueOnce(restoredWs);

      await useWorkspaceStore.getState().unarchiveWorkspace("ws-2");

      const target = useWorkspaceStore
        .getState()
        .workspaces.find((w) => w.id === "ws-2");
      expect(target?.status).toBe("active");
    });
  });

  describe("resetWorkspaceState & Auth Subscription Cleanup", () => {
    it("wipes state and clears localStorage on resetWorkspaceState", () => {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "ws-1");

      useWorkspaceStore.setState({
        workspaces: [mockActiveWs],
        activeWorkspaceId: "ws-1",
        isInitialized: true,
      });

      useWorkspaceStore.getState().resetWorkspaceState();

      const state = useWorkspaceStore.getState();
      expect(state.workspaces).toEqual([]);
      expect(state.activeWorkspaceId).toBeNull();
      expect(state.isInitialized).toBe(false);
      expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBeNull();
    });

    it("automatically resets workspace state when useAuthStore logs out", () => {
      useWorkspaceStore.setState({
        workspaces: [mockActiveWs],
        activeWorkspaceId: "ws-1",
        isInitialized: true,
      });
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "ws-1");

      // Simulate logged in auth store
      useAuthStore.setState({ isAuthenticated: true });

      // Trigger logout
      useAuthStore.getState().clearAuth();

      const state = useWorkspaceStore.getState();
      expect(state.workspaces).toEqual([]);
      expect(state.activeWorkspaceId).toBeNull();
      expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBeNull();
    });
  });
});
