import { create } from "zustand";
import { workspaceApi } from "@/apis/workspace.api";
import { getUserFacingApiError } from "@/utils/api-error-message";
import { useAuthStore } from "@/stores/auth.store";
import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
} from "@/types";

export const ACTIVE_WORKSPACE_STORAGE_KEY = "nexora_active_workspace_id";

export interface WorkspaceStoreState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Selectors / Getters
  getActiveWorkspace: () => Workspace | null;

  // Actions
  fetchWorkspaces: (force?: boolean) => Promise<void>;
  setActiveWorkspaceId: (id: string) => void;
  createWorkspace: (input: CreateWorkspaceRequest) => Promise<Workspace>;
  updateWorkspace: (id: string, input: UpdateWorkspaceRequest) => Promise<Workspace>;
  archiveWorkspace: (id: string) => Promise<Workspace>;
  unarchiveWorkspace: (id: string) => Promise<Workspace>;
  resetWorkspaceState: () => void;
}

let inFlightFetch: Promise<void> | null = null;

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  getActiveWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get();
    if (!activeWorkspaceId) return null;
    return workspaces.find((w) => w.id === activeWorkspaceId) || null;
  },

  fetchWorkspaces: async (force = false) => {
    // If not forced and already initialized with data, return early
    if (!force && get().isInitialized && !get().error) {
      return;
    }

    // Deduplicate concurrent requests
    if (inFlightFetch) {
      return inFlightFetch;
    }

    set({ isLoading: true, error: null });

    inFlightFetch = (async () => {
      try {
        const response = await workspaceApi.listWorkspaces({ page: 1, limit: 100 });
        const list = response.items;

        const storedId =
          typeof window !== "undefined"
            ? localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
            : null;

        let resolvedId: string | null = null;

        if (list.length === 0) {
          resolvedId = null;
        } else if (storedId && list.some((w) => w.id === storedId)) {
          const matched = list.find((w) => w.id === storedId)!;
          if (matched.status === "active") {
            // Rule 1: Persisted ID is active -> preserve it
            resolvedId = matched.id;
          } else {
            // Rule 2: Persisted ID is archived on cold boot -> prefer first active if one exists
            const firstActive = list.find((w) => w.status === "active");
            resolvedId = firstActive ? firstActive.id : matched.id;
          }
        } else {
          // Rule 3: Missing or foreign stored ID -> fallback to first active or first workspace
          const firstActive = list.find((w) => w.status === "active");
          resolvedId = firstActive ? firstActive.id : list[0].id;
        }

        if (typeof window !== "undefined") {
          if (resolvedId) {
            localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, resolvedId);
          } else {
            localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
          }
        }

        set({
          workspaces: list,
          activeWorkspaceId: resolvedId,
          isLoading: false,
          error: null,
          isInitialized: true,
        });
      } catch (err) {
        set({
          isLoading: false,
          error: getUserFacingApiError(err, "Failed to load workspaces. Please try again."),
          isInitialized: true,
        });
        throw err;
      } finally {
        inFlightFetch = null;
      }
    })();

    return inFlightFetch;
  },

  setActiveWorkspaceId: (id: string) => {
    const { workspaces } = get();
    const exists = workspaces.some((w) => w.id === id);
    if (!exists) return;

    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, id);
    }
    set({ activeWorkspaceId: id });
  },

  createWorkspace: async (input: CreateWorkspaceRequest) => {
    set({ isLoading: true, error: null });
    try {
      const newWs = await workspaceApi.createWorkspace(input);
      set((state) => ({
        workspaces: [newWs, ...state.workspaces],
        activeWorkspaceId: newWs.id,
        isLoading: false,
      }));

      if (typeof window !== "undefined") {
        localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, newWs.id);
      }

      return newWs;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateWorkspace: async (id: string, input: UpdateWorkspaceRequest) => {
    const updated = await workspaceApi.updateWorkspace(id, input);
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
    }));
    return updated;
  },

  archiveWorkspace: async (id: string) => {
    const archived = await workspaceApi.archiveWorkspace(id);
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? archived : w)),
    }));
    return archived;
  },

  unarchiveWorkspace: async (id: string) => {
    const unarchived = await workspaceApi.unarchiveWorkspace(id);
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? unarchived : w)),
    }));
    return unarchived;
  },

  resetWorkspaceState: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
    }
    inFlightFetch = null;
    set({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      error: null,
      isInitialized: false,
    });
  },
}));

// Safe Decoupled Session Cleanup: Reset workspace state when user session actually ends
useAuthStore.subscribe((state, prevState) => {
  if (prevState.isAuthenticated && !state.isAuthenticated) {
    useWorkspaceStore.getState().resetWorkspaceState();
  }
});
