import type { Workspace } from "@/types";
import { MOCK_CORE_PLATFORM_WORKSPACE, MOCK_WORKSPACES } from "@/mocks/data/workspaces.mock";

export const workspaceApi = {
  /**
   * Retrieves workspace details by workspace ID or slug
   * (Mock implementation ready for GET /api/v1/workspaces/:id)
   */
  async getWorkspace(idOrSlug: string = "ws-core-platform"): Promise<Workspace> {
    const found = MOCK_WORKSPACES.find(
      (ws) => ws.id === idOrSlug || ws.slug === idOrSlug
    );
    return found || MOCK_CORE_PLATFORM_WORKSPACE;
  },

  /**
   * Retrieves list of all workspaces accessible to the user
   * (Mock implementation ready for GET /api/v1/workspaces)
   */
  async listWorkspaces(): Promise<Workspace[]> {
    return MOCK_WORKSPACES;
  },
};
