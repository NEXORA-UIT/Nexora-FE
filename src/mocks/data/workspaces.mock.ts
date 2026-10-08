import type { Workspace } from "@/types";

export const MOCK_CORE_PLATFORM_WORKSPACE: Workspace = {
  id: "ws-core-platform",
  name: "Core Platform",
  slug: "core-platform",
  status: "active",
  description: "Product development and delivery workspace",
  memberCount: 12,
  activeBoardCount: 4,
  teamType: "Internal team",
  initials: "CP",
};

export const MOCK_WORKSPACES: Workspace[] = [MOCK_CORE_PLATFORM_WORKSPACE];
