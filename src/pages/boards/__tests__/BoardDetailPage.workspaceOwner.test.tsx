import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BoardDetailPage } from "../BoardDetailPage";
import { useAuthStore } from "@/stores/auth.store";
import { workspaceApi } from "@/apis/workspace.api";
import * as hooksModule from "@/hooks";
import type { BoardDetail, KanbanCard, ListWorkspaceMembersResponse, WorkspaceMemberDto } from "@/types";

// Mock kanban sub-views to keep test focused on BoardDetailPage permissions & drawer
vi.mock("@/components/kanban/BoardDetailHeader", () => ({
  BoardDetailHeader: () => <div data-testid="board-header">Board Header</div>,
}));

vi.mock("@/components/kanban/BoardDetailToolbar", () => ({
  BoardDetailToolbar: () => <div data-testid="board-toolbar">Board Toolbar</div>,
}));

vi.mock("@/components/kanban/KanbanBoard", () => ({
  KanbanBoard: () => <div data-testid="kanban-board">Kanban Board</div>,
}));

describe("BoardDetailPage Workspace Owner Permission & Dependency Access Suite", () => {
  const mockCardWithAttachment: KanbanCard = {
    id: "card-test-1",
    listId: "list-1",
    boardId: "board-101",
    code: "NEX-101",
    title: "Verify Workspace Ownership",
    position: 0,
    priority: "MEDIUM",
    status: "ACTIVE",
    labels: [],
    assignees: [],
    checklist: [],
    tasksCount: 0,
    completedTasksCount: 0,
    attachments: [
      {
        id: "att-other-1",
        cardId: "card-test-1",
        userId: "other-user-999",
        fileName: "other_user_spec.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
        uploadedBy: {
          id: "other-user-999",
          name: "Other User",
          initials: "OU",
        },
        createdAt: "2026-10-10T00:00:00.000Z",
      },
    ],
    comments: [],
    dependencies: [],
    createdAt: "2026-10-10T00:00:00.000Z",
    updatedAt: "2026-10-10T00:00:00.000Z",
  };

  const createMockBoard = (workspaceId = "ws-alpha", userRoleOnBoard: "PM" | "MEMBER" = "MEMBER"): BoardDetail => ({
    id: "board-101",
    workspaceId,
    name: "Core Platform",
    status: "ACTIVE",
    members: [
      {
        id: "user-target-1",
        name: "Target User",
        initials: "TU",
        role: userRoleOnBoard,
      },
    ],
    labels: [],
    lists: [
      {
        id: "list-1",
        boardId: "board-101",
        name: "To Do",
        category: "TODO",
        position: 0,
        status: "ACTIVE",
        cards: [mockCardWithAttachment],
        createdAt: "2026-10-10T00:00:00.000Z",
        updatedAt: "2026-10-10T00:00:00.000Z",
      },
    ],
    createdAt: "2026-10-10T00:00:00.000Z",
    updatedAt: "2026-10-10T00:00:00.000Z",
  });

  const createMockMemberDto = (workspaceId: string, role: "OWNER" | "MEMBER"): WorkspaceMemberDto => ({
    id: `wm-${workspaceId}-${role}`,
    workspaceId,
    userId: "user-target-1",
    role,
    createdAt: "2026-10-10T00:00:00.000Z",
    updatedAt: "2026-10-10T00:00:00.000Z",
    endedAt: null,
    user: {
      id: "user-target-1",
      email: "target@nexora.app",
      fullName: "Target User",
      status: "ACTIVE",
    },
  });

  const setupMockHook = (
    board: BoardDetail,
    selectedCard: KanbanCard = mockCardWithAttachment
  ) => {
    vi.spyOn(hooksModule, "useBoardDetail").mockReturnValue({
      board,
      filteredLists: board.lists,
      isLoading: false,
      error: null,
      reload: vi.fn(),
      searchQuery: "",
      setSearchQuery: vi.fn(),
      cardFilters: {
        statusGroup: "ALL",
        priority: "ALL",
        assigneeIds: [],
        dueDate: "ALL",
        labelIds: [],
      },
      setCardFilters: vi.fn(),
      activeView: "board",
      setActiveView: vi.fn(),
      selectedCardId: "card-test-1",
      selectedCard,
      handleSelectCard: vi.fn(),
      handleCloseCardDetail: vi.fn(),
      handleAddCard: vi.fn(),
      handleAddColumn: vi.fn(),
      handleCommitMoveCard: vi.fn(),
      handleStatusChange: vi.fn(),
      handleUpdateCard: vi.fn(),
      handleDeleteCard: vi.fn(),
      handleAddChecklistItem: vi.fn(),
      handleToggleChecklistItem: vi.fn(),
      handleDeleteChecklistItem: vi.fn(),
      isTasksLoading: false,
      tasksError: null,
      handleRetryTasks: vi.fn(),
      isAssignmentsLoading: false,
      assignmentsError: null,
      handleRetryAssignments: vi.fn(),
      handleAssignMember: vi.fn(),
      handleUnassignMember: vi.fn(),
      isLabelsLoading: false,
      labelsError: null,
      handleRetryLabels: vi.fn(),
      handleAttachCardLabel: vi.fn(),
      handleDetachCardLabel: vi.fn(),
      isCommentsLoading: false,
      commentsError: null,
      handleRetryComments: vi.fn(),
      handleAddComment: vi.fn(),
      handleUpdateComment: vi.fn(),
      handleDeleteComment: vi.fn(),
      isAttachmentsLoading: false,
      attachmentsError: null,
      isUploadingAttachment: false,
      handleRetryAttachments: vi.fn(),
      handleUploadAttachment: vi.fn(),
      handleDeleteAttachment: vi.fn(),
      handleDownloadAttachment: vi.fn(),
      pendingMemberUserId: null,
      pendingLabelId: null,
      pendingAttachmentId: null,
      fetchCardActivities: vi.fn().mockResolvedValue([]),
      allBoardCards: [mockCardWithAttachment],
      isDependenciesLoading: false,
      dependenciesError: null,
      handleRetryDependencies: vi.fn(),
      handleAddDependency: vi.fn(),
      handleDeleteDependency: vi.fn(),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: "user-target-1",
        email: "target@nexora.app",
        fullName: "Target User",
        status: "ACTIVE",
        avatarUrl: null,
        createdAt: "2026-10-10T00:00:00.000Z",
        updatedAt: "2026-10-10T00:00:00.000Z",
      },
      isAuthenticated: true,
      accessToken: "mock-token",
      refreshToken: "mock-refresh",
    });
  });

  it("identifies Workspace Owner from workspace membership and grants attachment delete + dependency management", async () => {
    const board = createMockBoard("ws-alpha", "MEMBER");
    setupMockHook(board);

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValueOnce({
      items: [createMockMemberDto("ws-alpha", "OWNER")],
    });

    render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert Workspace Owner is recognized and permissions are granted
    await waitFor(() => {
      // Fix C: Workspace Owner can manage dependencies
      expect(screen.getByRole("button", { name: /Add dependency/i })).toBeDefined();
      // Attachment delete button is visible for non-author attachment
      expect(screen.getByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeDefined();
    });
  });

  it("defaults to deny-by-default when workspaceApi.listWorkspaceMembers fails with HTTP 500 error", async () => {
    const board = createMockBoard("ws-alpha", "MEMBER");
    setupMockHook(board);

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockRejectedValueOnce(
      new Error("Internal Server Error (500)")
    );

    render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(workspaceApi.listWorkspaceMembers).toHaveBeenCalledWith("ws-alpha");
    });

    // Both privileges must remain denied
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
  });

  it("denies owner privileges when user is only MEMBER in both workspace and board", async () => {
    const board = createMockBoard("ws-alpha", "MEMBER");
    setupMockHook(board);

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValueOnce({
      items: [createMockMemberDto("ws-alpha", "MEMBER")],
    });

    render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(workspaceApi.listWorkspaceMembers).toHaveBeenCalledWith("ws-alpha");
    });

    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
  });

  it("denies owner privileges when currentUser is null or board has no workspaceId", async () => {
    useAuthStore.setState({ user: null });
    const board = createMockBoard("ws-alpha", "MEMBER");
    setupMockHook(board);

    const listMembersSpy = vi.spyOn(workspaceApi, "listWorkspaceMembers");

    render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(listMembersSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
  });

  it("ensures Owner of Workspace A is strictly NOT retained on initial render when switching to Workspace B (pre-effect invariant)", async () => {
    // Stage 1: Workspace Alpha where user is OWNER
    const boardAlpha = createMockBoard("ws-alpha", "MEMBER");
    setupMockHook(boardAlpha);

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockImplementation((wsId: string) => {
      if (wsId === "ws-alpha") {
        return Promise.resolve({
          items: [createMockMemberDto("ws-alpha", "OWNER")],
        });
      }
      // Workspace Beta request is intentionally held pending
      return new Promise(() => {});
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeDefined();
    });

    // Stage 2: User switches to Workspace Beta (request for Beta is still pending)
    const boardBeta = createMockBoard("ws-beta", "MEMBER");
    setupMockHook(boardBeta);

    rerender(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Context-bound invariant check: Even while Beta fetch is pending, Alpha's owner status is NOT used!
    expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
  });

  it("ensures Owner permissions of User A are NOT reused when switching to User B on the same board", async () => {
    // Stage 1: User A is OWNER in ws-alpha
    const board = createMockBoard("ws-alpha", "MEMBER");
    setupMockHook(board);

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValue({
      items: [createMockMemberDto("ws-alpha", "OWNER")], // user-target-1 is OWNER
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeDefined();
    });

    // Stage 2: Switch currentUser to User B (not owner)
    act(() => {
      useAuthStore.setState({
        user: {
          id: "user-target-2",
          email: "target2@nexora.app",
          fullName: "Target User Two",
          status: "ACTIVE",
          avatarUrl: null,
          createdAt: "2026-10-10T00:00:00.000Z",
          updatedAt: "2026-10-10T00:00:00.000Z",
        },
      });
    });

    rerender(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // User A's ownership must immediately NOT apply to User B
    expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
  });

  it("ensures slower response from previous workspace cannot overwrite newer workspace state", async () => {
    let resolveAlpha: (val: ListWorkspaceMembersResponse) => void;
    const promiseAlpha = new Promise<ListWorkspaceMembersResponse>((resolve) => {
      resolveAlpha = resolve;
    });

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockImplementation((wsId: string) => {
      if (wsId === "ws-alpha") {
        return promiseAlpha;
      }
      return Promise.resolve<ListWorkspaceMembersResponse>({
        items: [createMockMemberDto("ws-beta", "MEMBER")],
      });
    });

    const boardAlpha = createMockBoard("ws-alpha", "MEMBER");
    setupMockHook(boardAlpha);

    const { rerender } = render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Switch to Workspace Beta before Alpha resolves
    const boardBeta = createMockBoard("ws-beta", "MEMBER");
    setupMockHook(boardBeta);

    rerender(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Beta resolved as MEMBER (not owner)
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
    });

    // Now Alpha finally resolves with OWNER
    await act(async () => {
      resolveAlpha!({
        items: [createMockMemberDto("ws-alpha", "OWNER")],
      });
    });

    // Must still remain denied on Beta
    expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
  });

  it("allows uploader to delete own attachment even when regular MEMBER, but denies other attachments", async () => {
    const cardWithTwoAttachments: KanbanCard = {
      ...mockCardWithAttachment,
      attachments: [
        ...mockCardWithAttachment.attachments!,
        {
          id: "att-own-1",
          cardId: "card-test-1",
          userId: "user-target-1", // Authored by target user
          fileName: "my_own_notes.pdf",
          fileSize: 512,
          mimeType: "application/pdf",
          uploadedBy: {
            id: "user-target-1",
            name: "Target User",
            initials: "TU",
          },
          createdAt: "2026-10-10T00:00:00.000Z",
        },
      ],
    };

    const board = createMockBoard("ws-alpha", "MEMBER");
    board.lists[0].cards = [cardWithTwoAttachments];
    setupMockHook(board, cardWithTwoAttachments);

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValueOnce({
      items: [createMockMemberDto("ws-alpha", "MEMBER")],
    });

    render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Uploader can delete their own attachment
      expect(screen.getByRole("button", { name: /Delete my_own_notes\.pdf/i })).toBeDefined();
      // But cannot delete other user's attachment
      expect(screen.queryByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeNull();
    });
  });

  it("grants dependency management to Board PM even when user is not Workspace Owner", async () => {
    // User is Board PM, but only MEMBER in workspace
    const board = createMockBoard("ws-alpha", "PM");
    setupMockHook(board);

    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValueOnce({
      items: [createMockMemberDto("ws-alpha", "MEMBER")],
    });

    render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // Board PM can manage dependencies
      expect(screen.getByRole("button", { name: /Add dependency/i })).toBeDefined();
      // PM can also delete attachments per attachment contract
      expect(screen.getByRole("button", { name: /Delete other_user_spec\.pdf/i })).toBeDefined();
    });
  });
});
