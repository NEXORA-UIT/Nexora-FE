import type {
  KanbanCard,
  KanbanList,
  ListCategory,
  ListDto,
  ListStatusGroupDto,
} from "@/types";

/**
 * Maps Backend ListStatusGroupDto to Frontend UI ListCategory
 */
export function mapListStatusGroupToCategory(
  statusGroup: ListStatusGroupDto
): ListCategory {
  switch (statusGroup) {
    case "TODO":
      return "TODO";
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "DONE":
      return "DONE";
    default: {
      const _exhaustiveCheck: never = statusGroup;
      return _exhaustiveCheck;
    }
  }
}

/**
 * Maps Frontend UI ListCategory to Backend ListStatusGroupDto
 */
export function mapCategoryToListStatusGroup(
  category: ListCategory
): ListStatusGroupDto {
  switch (category) {
    case "TODO":
      return "TODO";
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "DONE":
      return "DONE";
    default: {
      const _exhaustiveCheck: never = category;
      return _exhaustiveCheck;
    }
  }
}

/**
 * Derives Frontend Kanban list status ('ACTIVE' | 'ARCHIVED') from Backend ListDto
 */
export function deriveListStatus(dto: ListDto): "ACTIVE" | "ARCHIVED" {
  if (dto.archivedAt) {
    return "ARCHIVED";
  }
  return "ACTIVE";
}

/**
 * Pure mapping function converting Backend ListDto to Frontend KanbanList model.
 * Preserves or attaches cards if provided. Defaults cards to [].
 */
export function mapListDtoToKanbanList(
  dto: ListDto,
  cards: KanbanCard[] = []
): KanbanList {
  return {
    id: dto.id,
    boardId: dto.boardId,
    name: dto.name,
    category: mapListStatusGroupToCategory(dto.statusGroup),
    position: dto.position,
    status: deriveListStatus(dto),
    cards,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Pure mapping function converting an array of Backend ListDtos to Frontend KanbanLists
 */
export function mapListDtosToKanbanLists(
  dtos: ListDto[],
  cardsByListId?: Record<string, KanbanCard[]>
): KanbanList[] {
  return (dtos || []).map((dto) =>
    mapListDtoToKanbanList(dto, cardsByListId?.[dto.id] ?? [])
  );
}
