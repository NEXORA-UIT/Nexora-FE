import type {
  CardDto,
  KanbanCard,
  KanbanList,
  TaskDto,
  ChecklistItem,
  CardAssignmentDto,
  BoardMember,
  BoardLabel,
  BoardLabelDto,
  CardLabelDto,
  CommentDto,
  CardComment,
  AttachmentDto,
  CardAttachment,
  CardPrerequisiteDto,
  CardDependency,
  ActivityLogDto,
  CardActivity,
} from "@/types";

/**
 * Derives Frontend UI card status ('ACTIVE' | 'ARCHIVED') from Backend CardDto
 */
export function deriveCardStatus(dto: CardDto): "ACTIVE" | "ARCHIVED" {
  if (dto.archivedAt) {
    return "ARCHIVED";
  }
  return "ACTIVE";
}

/**
 * Pure mapping function converting Backend CardDto to Frontend KanbanCard domain model.
 * Maps cardKey -> code, taskProgress -> tasksCount & completedTasksCount.
 * Allows supplying child entities (assignees, labels, checklist, dependencies, comments, attachments) via overrides.
 */
export function mapCardDtoToKanbanCard(
  dto: CardDto,
  overrides?: Partial<KanbanCard>
): KanbanCard {
  return {
    id: dto.id,
    listId: dto.listId,
    boardId: dto.boardId,
    code: dto.cardKey,
    title: dto.title,
    description: dto.description,
    startDate: dto.startDate,
    dueDate: dto.dueDate,
    priority: dto.priority,
    position: dto.position,
    status: deriveCardStatus(dto),
    statusGroup: overrides?.statusGroup ?? dto.statusGroup,
    assignees: overrides?.assignees ?? [],
    labels: overrides?.labels ?? [],
    tasksCount: overrides?.tasksCount ?? dto.taskProgress?.total ?? 0,
    completedTasksCount:
      overrides?.completedTasksCount ?? dto.taskProgress?.completed ?? 0,
    isBlocked: overrides?.isBlocked ?? false,
    blockReason: overrides?.blockReason,
    checklist: overrides?.checklist ?? [],
    dependencies: overrides?.dependencies ?? [],
    attachments: overrides?.attachments ?? [],
    comments: overrides?.comments ?? [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Pure mapping function converting an array of Backend CardDtos to Frontend KanbanCards
 */
export function mapCardDtosToKanbanCards(
  dtos: CardDto[],
  overridesMap?: Record<string, Partial<KanbanCard>>
): KanbanCard[] {
  return (dtos || []).map((dto) =>
    mapCardDtoToKanbanCard(dto, overridesMap?.[dto.id])
  );
}

export interface AssociateCardsResult {
  lists: KanbanList[];
  unassociatedCards: KanbanCard[];
}

/**
 * Deterministically associates Cards with Lists based on exact list ID matching.
 * - Handles lists sharing the same category/statusGroup without cross-contamination.
 * - Retains empty lists.
 * - Sorts cards within each list by position ASC, id ASC.
 * - Isolates any unassociated cards whose listId does not match any loaded list.
 */
export function associateCardsWithLists(
  lists: KanbanList[],
  cards: KanbanCard[]
): AssociateCardsResult {
  const listMap = new Map<string, KanbanList>();
  for (const list of lists) {
    listMap.set(list.id, {
      ...list,
      cards: [],
    });
  }

  const unassociatedCards: KanbanCard[] = [];

  for (const card of cards) {
    const targetList = listMap.get(card.listId);
    if (targetList) {
      targetList.cards.push({
        ...card,
        statusGroup: card.statusGroup ?? targetList.category,
      });
    } else {
      unassociatedCards.push(card);
    }
  }

  // Sort cards within each list by position ASC, id ASC
  for (const list of listMap.values()) {
    list.cards.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return a.id.localeCompare(b.id);
    });
  }

  return {
    lists: Array.from(listMap.values()),
    unassociatedCards,
  };
}

/**
 * Pure mapping function converting Backend TaskDto to Frontend ChecklistItem domain model.
 */
export function mapTaskDtoToChecklistItem(dto: TaskDto): ChecklistItem {
  return {
    id: dto.id,
    cardId: dto.cardId,
    title: dto.title,
    isCompleted: dto.isCompleted,
    position: dto.position,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Pure mapping function converting an array of Backend TaskDtos to Frontend ChecklistItems,
 * preserving Backend sort order (position ASC, id ASC).
 */
export function mapTaskDtosToChecklistItems(dtos: TaskDto[]): ChecklistItem[] {
  return (dtos || [])
    .slice()
    .sort((a, b) => {
      if (a.position !== b.position) {
        return a.position - b.position;
      }
      return a.id.localeCompare(b.id);
    })
    .map(mapTaskDtoToChecklistItem);
}

/**
 * Pure mapping function converting Backend CardAssignmentDto to Frontend BoardMember.
 * Looks up member in membersPool (board.members) to retain avatarUrl and role,
 * or derives safe initials and name from dto.user.
 */
export function mapCardAssignmentDtoToBoardMember(
  dto: CardAssignmentDto,
  membersPool?: BoardMember[]
): BoardMember {
  const existing = membersPool?.find((m) => m.id === dto.userId);
  if (existing) {
    return existing;
  }

  const name = dto.user?.fullName?.trim() || dto.user?.email || "Unknown Member";
  const parts = name.split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1
      ? (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
      : name.slice(0, parts.length === 1 ? 1 : 2).toUpperCase() || "U";

  return {
    id: dto.userId,
    name,
    initials,
    avatarUrl: dto.user?.avatarUrl ?? undefined,
  };
}

/**
 * Pure mapping function converting an array of Backend CardAssignmentDtos to Frontend BoardMembers.
 * Deduplicates by userId while preserving assignment order.
 */
export function mapCardAssignmentDtosToBoardMembers(
  dtos: CardAssignmentDto[],
  membersPool?: BoardMember[]
): BoardMember[] {
  const seen = new Set<string>();
  const result: BoardMember[] = [];
  for (const dto of dtos || []) {
    if (seen.has(dto.userId)) continue;
    seen.add(dto.userId);
    result.push(mapCardAssignmentDtoToBoardMember(dto, membersPool));
  }
  return result;
}

/**
 * Pure mapping function converting Backend BoardLabelDto to Frontend BoardLabel domain model.
 */
export function mapBoardLabelDtoToBoardLabel(dto: BoardLabelDto): BoardLabel {
  return {
    id: dto.id,
    boardId: dto.boardId,
    name: dto.name,
    color: dto.color,
  };
}

/**
 * Pure mapping function converting an array of Backend BoardLabelDtos to Frontend BoardLabels.
 */
export function mapBoardLabelDtosToBoardLabels(dtos: BoardLabelDto[]): BoardLabel[] {
  return (dtos || []).map(mapBoardLabelDtoToBoardLabel);
}

/**
 * Pure mapping function converting Backend CardLabelDto to Frontend BoardLabel domain model.
 */
export function mapCardLabelDtoToBoardLabel(dto: CardLabelDto): BoardLabel {
  return mapBoardLabelDtoToBoardLabel(dto.label);
}

/**
 * Pure mapping function converting an array of Backend CardLabelDtos to Frontend BoardLabels.
 * Preserves backend order (createdAt ASC) while deduplicating by label id.
 */
export function mapCardLabelDtosToBoardLabels(dtos: CardLabelDto[]): BoardLabel[] {
  const seen = new Set<string>();
  const result: BoardLabel[] = [];
  for (const dto of dtos || []) {
    if (!dto?.label?.id) continue;
    if (seen.has(dto.label.id)) continue;
    seen.add(dto.label.id);
    result.push(mapCardLabelDtoToBoardLabel(dto));
  }
  return result;
}

/**
 * Pure mapping function converting Backend CommentDto to Frontend CardComment domain model.
 * Looks up member in membersPool (board.members) by userId, or falls back to neutral "Unknown Member".
 * Preserves soft-delete semantics (content: null, deletedAt).
 */
export function mapCommentDtoToCardComment(
  dto: CommentDto,
  membersPool?: BoardMember[]
): CardComment {
  const member = membersPool?.find((m) => m.id === dto.userId);
  const author: BoardMember = member
    ? { ...member }
    : {
        id: dto.userId,
        name: "Unknown Member",
        initials: "U",
      };

  const isDeleted = Boolean(dto.deletedAt || dto.content === null);

  return {
    id: dto.id,
    cardId: dto.cardId,
    userId: dto.userId,
    author,
    content: dto.content,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    deletedAt: dto.deletedAt ?? null,
    isDeleted,
  };
}

/**
 * Pure mapping function converting an array of Backend CommentDtos to Frontend CardComments,
 * preserving Backend sort order (createdAt ASC, id ASC).
 */
export function mapCommentDtosToCardComments(
  dtos: CommentDto[],
  membersPool?: BoardMember[]
): CardComment[] {
  return (dtos || []).map((dto) => mapCommentDtoToCardComment(dto, membersPool));
}

/**
 * Formats file size in bytes to a human-readable string (e.g. 1.5 MB, 320 KB).
 */
export function formatFileSize(bytes: number | string): string {
  if (typeof bytes === "string") return bytes;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Pure mapping function converting Backend AttachmentDto to Frontend CardAttachment domain model.
 * Looks up member in membersPool (board.members) by userId, or falls back to neutral "Unknown Member".
 */
export function mapAttachmentDtoToCardAttachment(
  dto: AttachmentDto,
  membersPool?: BoardMember[]
): CardAttachment {
  const member = membersPool?.find((m) => m.id === dto.userId);
  const uploadedBy: BoardMember = member
    ? { ...member }
    : {
        id: dto.userId,
        name: "Unknown Member",
        initials: "U",
      };

  return {
    id: dto.id,
    cardId: dto.cardId,
    userId: dto.userId,
    fileName: dto.fileName,
    fileSize: dto.fileSize,
    mimeType: dto.mimeType,
    uploadedBy,
    createdAt: dto.createdAt,
    uploadedAt: dto.createdAt,
  };
}

/**
 * Pure mapping function converting an array of Backend AttachmentDtos to Frontend CardAttachments,
 * preserving Backend sort order (createdAt ASC, id ASC).
 */
export function mapAttachmentDtosToCardAttachments(
  dtos: AttachmentDto[],
  membersPool?: BoardMember[]
): CardAttachment[] {
  return (dtos || []).map((dto) => mapAttachmentDtoToCardAttachment(dto, membersPool));
}

/**
 * Pure mapping function converting Backend CardPrerequisiteDto to Frontend CardDependency domain model.
 * The dto.dependencyId represents the unique relation ID used for deletion.
 */
export function mapCardPrerequisiteDtoToCardDependency(
  dto: CardPrerequisiteDto,
  targetCardId: string
): CardDependency {
  const status = dto.list?.statusGroup ?? "TODO";
  return {
    id: dto.dependencyId,
    cardId: targetCardId,
    prerequisiteCardId: dto.id,
    prerequisiteCode: dto.cardKey,
    prerequisiteTitle: dto.title,
    prerequisiteStatus: status,
    isCompleted: status === "DONE",
  };
}

/**
 * Pure mapping function converting an array of Backend CardPrerequisiteDtos to Frontend CardDependencies.
 */
export function mapCardPrerequisiteDtosToCardDependencies(
  dtos: CardPrerequisiteDto[],
  targetCardId: string
): CardDependency[] {
  return (dtos || []).map((d) => mapCardPrerequisiteDtoToCardDependency(d, targetCardId));
}

/**
 * Maps Backend ActivityLog action string and details to human-readable sentence.
 */
export function formatActivityAction(action: string, details?: Record<string, unknown>): string {
  switch (action) {
    case "CARD_CREATED":
      return "created this card";
    case "CARD_UPDATED":
      return "updated this card";
    case "CARD_MOVED":
      return "moved this card";
    case "CARD_ARCHIVED":
      return "archived this card";
    case "CARD_RESTORED":
      return "restored this card";
    case "COMMENT_CREATED":
      return "commented on this card";
    case "COMMENT_UPDATED":
      return "edited a comment";
    case "COMMENT_DELETED":
      return "deleted a comment";
    case "ATTACHMENT_CREATED":
      return details?.fileName ? `attached "${String(details.fileName)}"` : "added an attachment";
    case "ATTACHMENT_DELETED":
      return "removed an attachment";
    case "TASK_CREATED":
      return "added a checklist item";
    case "TASK_UPDATED":
      return "updated a checklist item";
    case "TASK_DELETED":
      return "removed a checklist item";
    case "CARD_ASSIGNED":
      return "assigned a member";
    case "CARD_UNASSIGNED":
      return "unassigned a member";
    case "CARD_DEPENDENCY_ADDED":
      return "added a dependency";
    case "CARD_DEPENDENCY_REMOVED":
      return "removed a dependency";
    case "LABEL_LINKED":
      return "attached a label";
    case "LABEL_UNLINKED":
      return "removed a label";
    default:
      return action.toLowerCase().replace(/_/g, " ");
  }
}

/**
 * Pure mapping function converting Backend ActivityLogDto to Frontend CardActivity domain model.
 * Looks up actor in membersPool by actorId or falls back to a neutral user representation.
 */
export function mapActivityLogDtoToCardActivity(
  dto: ActivityLogDto,
  membersPool?: BoardMember[]
): CardActivity {
  const actor = membersPool?.find((m) => m.id === dto.actorId) ?? {
    id: dto.actorId,
    name: "User",
    email: "",
    role: "MEMBER",
    initials: "U",
  };

  return {
    id: dto.id,
    cardId: dto.cardId ?? "",
    user: actor,
    action: formatActivityAction(dto.action, dto.details),
    createdAt: dto.createdAt,
  };
}

/**
 * Pure mapping function converting an array of Backend ActivityLogDtos to Frontend CardActivities.
 */
export function mapActivityLogDtosToCardActivities(
  dtos: ActivityLogDto[],
  membersPool?: BoardMember[]
): CardActivity[] {
  return (dtos || []).map((d) => mapActivityLogDtoToCardActivity(d, membersPool));
}

