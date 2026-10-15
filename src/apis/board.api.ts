import { apiClient } from "@/apis/client";
import {
  mapBoardDtoToBoard,
  mapBoardDtosToBoards,
  mapBoardMemberDtoToBoardMember,
  mapBoardDashboardDtoToBoardDashboard,
} from "@/mappers/board.mapper";
import type {
  Board,
  BoardDto,
  BoardMember,
  BoardMemberDto,
  CreateBoardInput,
  CreateBoardRequest,
  UpdateBoardRequest,
  ConfirmDeleteBoardRequest,
  AssignBoardPmRequest,
  BoardDashboard,
  BoardDashboardDto,
  ListBoardsQuery,
  ApiSuccessResponse,
} from "@/types";

export const boardApi = {
  /**
   * Retrieves all boards in a given workspace
   * GET /api/v1/workspaces/:workspaceId/boards
   */
  async getBoards(
    workspaceId: string,
    options?: ListBoardsQuery
  ): Promise<Board[]> {
    const params: Record<string, string> = {};
    if (options?.includeArchived !== undefined) {
      params.includeArchived = options.includeArchived ? "true" : "false";
    }

    const response = await apiClient.get<ApiSuccessResponse<BoardDto[]>>(
      `/workspaces/${workspaceId}/boards`,
      {
        params: Object.keys(params).length > 0 ? params : undefined,
      }
    );

    return mapBoardDtosToBoards(response.data.data || []);
  },

  /**
   * Retrieves board metadata by ID
   * GET /api/v1/boards/:id
   */
  async getBoard(boardId: string): Promise<Board> {
    const response = await apiClient.get<ApiSuccessResponse<BoardDto>>(
      `/boards/${boardId}`
    );

    return mapBoardDtoToBoard(response.data.data);
  },

  /**
   * Retrieves all members of a board
   * GET /api/v1/boards/:id/members
   */
  async getBoardMembers(boardId: string): Promise<BoardMember[]> {
    const response = await apiClient.get<ApiSuccessResponse<BoardMemberDto[]>>(
      `/boards/${boardId}/members`
    );

    return (response.data.data || []).map(mapBoardMemberDtoToBoardMember);
  },

  /**
   * Creates a new board in a given workspace (Workspace Owner only)
   * POST /api/v1/workspaces/:workspaceId/boards
   */
  async createBoard(
    workspaceIdOrInput: string | CreateBoardInput,
    payload?: CreateBoardRequest
  ): Promise<Board> {
    let workspaceId: string;
    let rawBody: CreateBoardRequest;

    if (typeof workspaceIdOrInput === "string") {
      if (!payload) {
        throw new Error("Board creation payload is required when specifying workspaceId.");
      }
      workspaceId = workspaceIdOrInput;
      rawBody = payload;
    } else {
      workspaceId = workspaceIdOrInput.workspaceId;
      rawBody = {
        name: (workspaceIdOrInput.name || workspaceIdOrInput.title || "").trim(),
      };
      if (workspaceIdOrInput.description !== undefined) {
        rawBody.description = workspaceIdOrInput.description?.trim() || null;
      }
      if (workspaceIdOrInput.coverColor !== undefined) {
        rawBody.coverColor = workspaceIdOrInput.coverColor;
      }
    }

    const trimmedName = (rawBody?.name || "").trim();
    if (!trimmedName) {
      throw new Error("Board name is required and cannot be empty.");
    }

    const cleanBody: CreateBoardRequest = {
      name: trimmedName,
    };
    if (rawBody.description !== undefined) {
      cleanBody.description = rawBody.description?.trim() || null;
    }
    if (rawBody.coverColor !== undefined && rawBody.coverColor !== "") {
      cleanBody.coverColor = rawBody.coverColor;
    }
    if (rawBody.coverUrl !== undefined && rawBody.coverUrl !== "") {
      cleanBody.coverUrl = rawBody.coverUrl;
    }
    if (rawBody.pmId !== undefined && rawBody.pmId !== "") {
      cleanBody.pmId = rawBody.pmId;
    }

    const response = await apiClient.post<ApiSuccessResponse<BoardDto>>(
      `/workspaces/${workspaceId}/boards`,
      cleanBody
    );

    return mapBoardDtoToBoard(response.data.data);
  },

  /**
   * Updates board metadata (Workspace Owner or Board PM only)
   * PATCH /api/v1/boards/:id
   */
  async updateBoard(
    boardId: string,
    data: UpdateBoardRequest
  ): Promise<Board> {
    const cleanBody: UpdateBoardRequest = {};
    if (data.name !== undefined) {
      cleanBody.name = data.name.trim();
    }
    if (data.description !== undefined) {
      cleanBody.description = data.description?.trim() || null;
    }
    if (data.coverColor !== undefined) {
      cleanBody.coverColor = data.coverColor;
    }
    if (data.coverUrl !== undefined) {
      cleanBody.coverUrl = data.coverUrl;
    }

    const response = await apiClient.patch<ApiSuccessResponse<BoardDto>>(
      `/boards/${boardId}`,
      cleanBody
    );

    return mapBoardDtoToBoard(response.data.data);
  },

  /**
   * Archives an active board (Workspace Owner or Board PM only)
   * PATCH /api/v1/boards/:id/archive
   */
  async archiveBoard(boardId: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/boards/${boardId}/archive`
    );
  },

  /**
   * Restores an archived board to active status (Workspace Owner or Board PM only)
   * PATCH /api/v1/boards/:id/unarchive
   */
  async restoreBoard(boardId: string): Promise<void> {
    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/boards/${boardId}/unarchive`
    );
  },

  /**
   * Permanently deletes an archived board (Workspace Owner only)
   * DELETE /api/v1/boards/:id
   */
  async deleteBoard(
    boardId: string,
    confirmation: string | ConfirmDeleteBoardRequest
  ): Promise<void> {
    const body: ConfirmDeleteBoardRequest =
      typeof confirmation === "string"
        ? { confirmationName: confirmation }
        : confirmation;

    await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
      `/boards/${boardId}`,
      {
        data: body,
      }
    );
  },

  /**
   * Assigns or changes Project Manager (PM) for a board (Workspace Owner only)
   * PATCH /api/v1/boards/:id/pm
   */
  async assignBoardPm(
    boardId: string,
    payload: string | AssignBoardPmRequest
  ): Promise<void> {
    const body: AssignBoardPmRequest =
      typeof payload === "string" ? { pmId: payload } : payload;

    await apiClient.patch<ApiSuccessResponse<Record<string, never>>>(
      `/boards/${boardId}/pm`,
      body
    );
  },

  /**
   * Retrieves aggregated statistical metrics of a project board
   * GET /api/v1/boards/:id/dashboard
   */
  async getBoardDashboard(boardId: string): Promise<BoardDashboard> {
    const response = await apiClient.get<ApiSuccessResponse<BoardDashboardDto>>(
      `/boards/${boardId}/dashboard`
    );

    return mapBoardDashboardDtoToBoardDashboard(response.data.data);
  },
};
