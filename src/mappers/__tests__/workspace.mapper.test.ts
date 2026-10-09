import { describe, it, expect } from "vitest";
import {
  domainCategoryToTeamType,
  generateWorkspaceInitials,
  generateWorkspaceSlug,
  deriveWorkspaceStatus,
  mapWorkspaceDtoToDomain,
} from "../workspace.mapper";
import type { WorkspaceDto } from "@/types";

describe("workspace.mapper Suite", () => {
  describe("domainCategoryToTeamType", () => {
    it("maps all backend categories to human labels", () => {
      expect(domainCategoryToTeamType("SOFTWARE")).toBe("Software Engineering");
      expect(domainCategoryToTeamType("EDUCATION")).toBe("Education");
      expect(domainCategoryToTeamType("RESEARCH_ACADEMIC")).toBe("Research & Academic");
      expect(domainCategoryToTeamType("MARKETING")).toBe("Marketing");
      expect(domainCategoryToTeamType("EVENT")).toBe("Event Management");
      expect(domainCategoryToTeamType("INTERNAL_OPERATIONS")).toBe("Internal Operations");
      expect(domainCategoryToTeamType("OTHER")).toBe("General");
    });

    it("falls back to 'General' for null or undefined", () => {
      expect(domainCategoryToTeamType(null)).toBe("General");
      expect(domainCategoryToTeamType(undefined)).toBe("General");
    });
  });

  describe("generateWorkspaceInitials", () => {
    it("extracts 2 letters from multi-word names", () => {
      expect(generateWorkspaceInitials("Core Platform")).toBe("CP");
      expect(generateWorkspaceInitials("Nexora AI Agent")).toBe("NA");
    });

    it("extracts 2 letters from single-word names", () => {
      expect(generateWorkspaceInitials("Nexora")).toBe("NE");
      expect(generateWorkspaceInitials("Engineering")).toBe("EN");
    });

    it("handles single-character and empty names gracefully", () => {
      expect(generateWorkspaceInitials("X")).toBe("X");
      expect(generateWorkspaceInitials("")).toBe("WS");
      expect(generateWorkspaceInitials("   ")).toBe("WS");
    });
  });

  describe("generateWorkspaceSlug", () => {
    it("converts names into URL-friendly slugs", () => {
      expect(generateWorkspaceSlug("Core Platform", "fb-1")).toBe("core-platform");
      expect(generateWorkspaceSlug("Web & Mobile App!", "fb-2")).toBe("web-mobile-app");
    });

    it("falls back to id if name produces an empty slug", () => {
      expect(generateWorkspaceSlug("!@#$%", "fallback-uuid")).toBe("fallback-uuid");
      expect(generateWorkspaceSlug("", "fallback-uuid")).toBe("fallback-uuid");
    });
  });

  describe("deriveWorkspaceStatus", () => {
    const baseDto: WorkspaceDto = {
      id: "ws-1",
      name: "Test WS",
      description: null,
      domainCategory: "SOFTWARE",
      isFrozen: false,
      archivedAt: null,
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    };

    it("returns 'active' when not archived and not frozen", () => {
      expect(deriveWorkspaceStatus(baseDto)).toBe("active");
    });

    it("returns 'archived' when archivedAt is present", () => {
      expect(
        deriveWorkspaceStatus({
          ...baseDto,
          archivedAt: "2026-10-09T10:00:00.000Z",
        })
      ).toBe("archived");
    });

    it("returns 'paused' when isFrozen is true and not archived", () => {
      expect(
        deriveWorkspaceStatus({
          ...baseDto,
          isFrozen: true,
        })
      ).toBe("paused");
    });

    it("prioritizes 'archived' over 'paused' when both are set", () => {
      expect(
        deriveWorkspaceStatus({
          ...baseDto,
          isFrozen: true,
          archivedAt: "2026-10-09T10:00:00.000Z",
        })
      ).toBe("archived");
    });
  });

  describe("mapWorkspaceDtoToDomain", () => {
    const mockDto: WorkspaceDto = {
      id: "ws-uuid-123",
      name: "Engineering Core",
      description: "Primary engineering workspace",
      domainCategory: "SOFTWARE",
      isFrozen: false,
      archivedAt: null,
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
    };

    it("maps all DTO fields correctly to the domain model", () => {
      const result = mapWorkspaceDtoToDomain(mockDto);

      expect(result.id).toBe("ws-uuid-123");
      expect(result.name).toBe("Engineering Core");
      expect(result.slug).toBe("engineering-core");
      expect(result.status).toBe("active");
      expect(result.description).toBe("Primary engineering workspace");
      expect(result.teamType).toBe("Software Engineering");
      expect(result.initials).toBe("EC");
      expect(result.isFrozen).toBe(false);
      // Crucial: do not fabricate counts
      expect(result.memberCount).toBeUndefined();
      expect(result.activeBoardCount).toBeUndefined();
    });

    it("handles null description by defaulting to an empty string", () => {
      const result = mapWorkspaceDtoToDomain({ ...mockDto, description: null });
      expect(result.description).toBe("");
    });

    it("accepts verified count overrides if explicitly provided", () => {
      const result = mapWorkspaceDtoToDomain(mockDto, {
        memberCount: 5,
        activeBoardCount: 3,
      });

      expect(result.memberCount).toBe(5);
      expect(result.activeBoardCount).toBe(3);
    });
  });
});
