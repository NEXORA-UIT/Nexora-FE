import { describe, it, expect } from "vitest";
import {
  deriveBoardStatus,
  mapBoardDtoToBoard,
  mapBoardDtosToBoards,
  mapBoardMemberDtoToBoardMember,
} from "../board.mapper";
import type { BoardDto, BoardMemberDto } from "@/types";

describe("board.mapper Suite", () => {
  const mockActiveDto: BoardDto = {
    id: "board-uuid-1",
    workspaceId: "ws-uuid-1",
    name: "Engineering Kanban",
    description: "Core sprint tracking board",
    coverColor: "#3B82F6",
    coverUrl: "https://example.com/cover.png",
    status: "ACTIVE",
    pmId: "user-pm-1",
    archivedAt: null,
    createdAt: "2026-10-09T08:00:00.000Z",
    updatedAt: "2026-10-09T09:30:00.000Z",
  };

  const mockArchivedDto: BoardDto = {
    id: "board-uuid-2",
    workspaceId: "ws-uuid-1",
    name: "Legacy Migration",
    description: "Archived migration tasks",
    coverColor: null,
    coverUrl: null,
    status: "ARCHIVED",
    pmId: null,
    archivedAt: "2026-10-09T12:00:00.000Z",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-09T12:00:00.000Z",
  };

  describe("deriveBoardStatus", () => {
    it("returns 'active' when status is ACTIVE and archivedAt is null", () => {
      expect(deriveBoardStatus(mockActiveDto)).toBe("active");
    });

    it("returns 'archived' when status is ARCHIVED", () => {
      expect(deriveBoardStatus(mockArchivedDto)).toBe("archived");
    });

    it("returns 'archived' when status is ACTIVE but archivedAt timestamp is present", () => {
      const anomalyDto: BoardDto = {
        ...mockActiveDto,
        status: "ACTIVE",
        archivedAt: "2026-10-09T10:00:00.000Z",
      };
      expect(deriveBoardStatus(anomalyDto)).toBe("archived");
    });
  });

  describe("mapBoardDtoToBoard", () => {
    it("maps all fields correctly from active DTO to UI Board model", () => {
      const result = mapBoardDtoToBoard(mockActiveDto);

      expect(result.id).toBe("board-uuid-1");
      expect(result.workspaceId).toBe("ws-uuid-1");
      expect(result.name).toBe("Engineering Kanban");
      expect(result.title).toBe("Engineering Kanban");
      expect(result.description).toBe("Core sprint tracking board");
      expect(result.status).toBe("active");
      expect(result.coverColor).toBe("#3B82F6");
      expect(result.coverUrl).toBe("https://example.com/cover.png");
      expect(result.createdAt).toBe("2026-10-09T08:00:00.000Z");
      expect(result.updatedAt).toBe("2026-10-09T09:30:00.000Z");

      // Critical requirement: do not fabricate statistics
      expect(result.openTasksCount).toBeUndefined();
      expect(result.completedPercent).toBeUndefined();
      expect(result.members).toEqual([]);
    });

    it("preserves null description, coverColor, and coverUrl accurately", () => {
      const result = mapBoardDtoToBoard({
        ...mockActiveDto,
        description: null,
        coverColor: null,
        coverUrl: null,
      });

      expect(result.description).toBeNull();
      expect(result.coverColor).toBeNull();
      expect(result.coverUrl).toBeNull();
    });

    it("maps archived DTO to UI Board model with 'archived' status", () => {
      const result = mapBoardDtoToBoard(mockArchivedDto);

      expect(result.id).toBe("board-uuid-2");
      expect(result.title).toBe("Legacy Migration");
      expect(result.status).toBe("archived");
      expect(result.coverColor).toBeNull();
      expect(result.coverUrl).toBeNull();
    });

    it("accepts verified metric/member overrides when explicitly provided", () => {
      const mockMembers = [
        { id: "m-1", name: "Alice", initials: "A", role: "PM" },
      ];

      const result = mapBoardDtoToBoard(mockActiveDto, {
        openTasksCount: 14,
        completedPercent: 75,
        members: mockMembers,
      });

      expect(result.openTasksCount).toBe(14);
      expect(result.completedPercent).toBe(75);
      expect(result.members).toEqual(mockMembers);
    });
  });

  describe("mapBoardDtosToBoards", () => {
    it("maps an array of BoardDto items", () => {
      const results = mapBoardDtosToBoards([mockActiveDto, mockArchivedDto]);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe("board-uuid-1");
      expect(results[0].status).toBe("active");
      expect(results[1].id).toBe("board-uuid-2");
      expect(results[1].status).toBe("archived");
    });

    it("handles empty array gracefully", () => {
      const results = mapBoardDtosToBoards([]);
      expect(results).toEqual([]);
    });

    it("handles null or undefined input gracefully", () => {
      // @ts-expect-error Testing runtime resilience
      expect(mapBoardDtosToBoards(null)).toEqual([]);
      // @ts-expect-error Testing runtime resilience
      expect(mapBoardDtosToBoards(undefined)).toEqual([]);
    });
  });

  describe("mapBoardMemberDtoToBoardMember", () => {
    it("maps member DTO with user fullName and computes initials correctly", () => {
      const dto: BoardMemberDto = {
        id: "mem-1",
        boardId: "board-1",
        userId: "user-1",
        role: "PM",
        createdAt: "2026-10-09T08:00:00.000Z",
        user: {
          id: "user-1",
          email: "dat.phan@example.com",
          fullName: "Phan Gia Dat",
          avatarUrl: "https://example.com/avatar.png",
        },
      };

      const result = mapBoardMemberDtoToBoardMember(dto);
      expect(result).toEqual({
        id: "user-1",
        name: "Phan Gia Dat",
        initials: "PG",
        avatarUrl: "https://example.com/avatar.png",
        role: "PM",
      });
    });

    it("falls back to email when fullName is empty", () => {
      const dto: BoardMemberDto = {
        id: "mem-2",
        boardId: "board-1",
        userId: "user-2",
        role: "MEMBER",
        createdAt: "2026-10-09T08:00:00.000Z",
        user: {
          id: "user-2",
          email: "member@example.com",
          fullName: "",
          avatarUrl: null,
        },
      };

      const result = mapBoardMemberDtoToBoardMember(dto);
      expect(result.id).toBe("user-2");
      expect(result.name).toBe("member@example.com");
      expect(result.initials).toBe("M");
      expect(result.avatarUrl).toBeUndefined();
      expect(result.role).toBe("MEMBER");
    });
  });
});
