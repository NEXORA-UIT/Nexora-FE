import type { Board, BoardDto, BoardMember, BoardStatus } from "@/types";

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
