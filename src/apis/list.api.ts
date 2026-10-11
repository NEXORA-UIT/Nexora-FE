import type {
  KanbanList,
  CreateListInput,
  UpdateListInput,
  ReorderListInput,
  ListDto,
  ListStatusGroupDto,
  ListListsQuery,
  CreateListRequest,
  UpdateListRequest,
  ReorderListRequest,
  ArchiveListRequest,
  ApiSuccessResponse,
} from "@/types";
import { apiClient } from "./client";
import {
  mapCategoryToListStatusGroup,
  mapListDtoToKanbanList,
  mapListDtosToKanbanLists,
} from "@/mappers/list.mapper";

export const listApi = {
  /**
   * Retrieves all Kanban lists for a given board
   * GET /api/v1/boards/:boardId/lists
   */
  async getBoardLists(
    boardId: string,
    options?: ListListsQuery
  ): Promise<KanbanList[]> {
    const params: Record<string, string> = {};
    if (options?.includeArchived !== undefined) {
      params.includeArchived = options.includeArchived ? "true" : "false";
    }

    const response = await apiClient.get<ApiSuccessResponse<ListDto[]>>(
      `/boards/${boardId}/lists`,
      {
        params: Object.keys(params).length > 0 ? params : undefined,
      }
    );

    return mapListDtosToKanbanLists(response.data.data || []);
  },

  /**
   * Creates a new Kanban list column in a board
   * POST /api/v1/boards/:boardId/lists
   */
  async createList(
    boardId: string,
    payload: CreateListInput | CreateListRequest
  ): Promise<KanbanList> {
    const statusGroup: ListStatusGroupDto =
      "statusGroup" in payload
        ? payload.statusGroup
        : mapCategoryToListStatusGroup(payload.category);

    const body: CreateListRequest = {
      name: payload.name.trim(),
      statusGroup,
    };

    const response = await apiClient.post<ApiSuccessResponse<ListDto>>(
      `/boards/${boardId}/lists`,
      body
    );

    return mapListDtoToKanbanList(response.data.data);
  },

  /**
   * Updates an existing Kanban list's name and/or statusGroup
   * PATCH /api/v1/lists/:id
   */
  async updateList(
    listId: string,
    payload: UpdateListInput | UpdateListRequest
  ): Promise<KanbanList> {
    const body: UpdateListRequest = {};

    if (payload.name !== undefined) {
      body.name = payload.name.trim();
    }

    if ("statusGroup" in payload && payload.statusGroup) {
      body.statusGroup = payload.statusGroup;
    } else if ("category" in payload && payload.category) {
      body.statusGroup = mapCategoryToListStatusGroup(payload.category);
    }

    const response = await apiClient.patch<ApiSuccessResponse<ListDto>>(
      `/lists/${listId}`,
      body
    );

    return mapListDtoToKanbanList(response.data.data);
  },

  /**
   * Reorders a list position
   * PATCH /api/v1/lists/:id/position
   */
  async reorderList(
    listId: string,
    positionOrInput: number | ReorderListInput | ReorderListRequest
  ): Promise<KanbanList> {
    const position =
      typeof positionOrInput === "number"
        ? positionOrInput
        : positionOrInput.position;

    const response = await apiClient.patch<ApiSuccessResponse<ListDto>>(
      `/lists/${listId}/position`,
      { position }
    );

    return mapListDtoToKanbanList(response.data.data);
  },

  /**
   * Archives a Kanban list
   * PATCH /api/v1/lists/:id/archive
   */
  async archiveList(
    listId: string,
    payload?: ArchiveListRequest
  ): Promise<void> {
    const body: ArchiveListRequest = {};

    if (payload?.moveCardsToListId) {
      body.moveCardsToListId = payload.moveCardsToListId;
    }

    if (payload?.archiveCards !== undefined) {
      body.archiveCards = payload.archiveCards;
    }

    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/lists/${listId}/archive`,
      body
    );
  },

  /**
   * Restores an archived Kanban list
   * PATCH /api/v1/lists/:id/restore
   */
  async restoreList(listId: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/lists/${listId}/restore`
    );
  },
};
