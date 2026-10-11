import type {
  Board,
  BoardDto,
  BoardMember,
  BoardMemberDto,
  BoardStatus,
  BoardDashboard,
  BoardDashboardDto,
} from "@/types";

/**
 * Derives Frontend UI board status ('active' | 'archived') from Backend BoardDto
 */
export function deriveBoardStatus(dto: BoardDto): BoardStatus {
  if (dto.status === "ARCHIVED" || Boolean(dto.archivedAt)) {
    return "archived";
  }
  return "active";
}

export interface BoardMappingOverrides {
  openTasksCount?: number;
  completedPercent?: number;
  members?: BoardMember[];
}

/**
 * Pure mapping function converting Backend BoardDto to Frontend Board model.
 * Does not fabricate missing statistics (openTasksCount, completedPercent remain undefined).
 */
export function mapBoardDtoToBoard(
  dto: BoardDto,
  overrides?: BoardMappingOverrides
): Board {
  return {
    id: dto.id,
    workspaceId: dto.workspaceId,
    name: dto.name,
    title: dto.name,
    description: dto.description,
    status: deriveBoardStatus(dto),
    coverColor: dto.coverColor,
    coverUrl: dto.coverUrl,
    members: overrides?.members ?? [],
    openTasksCount: overrides?.openTasksCount,
    completedPercent: overrides?.completedPercent,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Pure mapping function converting an array of Backend BoardDtos to Frontend Board models
 */
export function mapBoardDtosToBoards(
  dtos: BoardDto[],
  overridesMap?: Record<string, BoardMappingOverrides>
): Board[] {
  return (dtos || []).map((dto) =>
    mapBoardDtoToBoard(dto, overridesMap?.[dto.id])
  );
}

/**
 * Pure mapping function converting Backend BoardMemberDto to Frontend BoardMember model.
 * Computes uppercase initials from fullName or email prefix.
 */
export function mapBoardMemberDtoToBoardMember(
  dto: BoardMemberDto
): BoardMember {
  const name = dto.user.fullName?.trim() || dto.user.email;
  const parts = name.split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1
      ? (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
      : name.slice(0, parts.length === 1 ? 1 : 2).toUpperCase();

  return {
    id: dto.user.id || dto.userId,
    name,
    initials,
    avatarUrl: dto.user.avatarUrl ?? undefined,
    role: dto.role,
  };
}

/**
 * Pure mapping function converting Backend BoardDashboardDto to Frontend BoardDashboard domain model.
 */
export function mapBoardDashboardDtoToBoardDashboard(
  dto: BoardDashboardDto
): BoardDashboard {
  return {
    totalCards: dto.totalCards,
    completedCards: dto.done,
    inProgressCards: dto.inProgress,
    todoCards: dto.todo,
    overdueCards: dto.overdue,
    completionRate: dto.completionPercent,
  };
}
