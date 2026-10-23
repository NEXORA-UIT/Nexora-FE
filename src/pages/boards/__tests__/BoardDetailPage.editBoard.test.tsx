import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { BoardDetailPage } from "../BoardDetailPage";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { workspaceApi } from "@/apis/workspace.api";
import * as hooksModule from "@/hooks";
import type { BoardDetail, BoardCardFilters, ListWorkspaceMembersResponse } from "@/types";

// Mock heavy sub-components
vi.mock("@/components/kanban/BoardDetailToolbar", () => ({
  BoardDetailToolbar: () => <div data-testid="board-toolbar">Toolbar</div>,
}));
vi.mock("@/components/kanban/KanbanBoard", () => ({
  KanbanBoard: () => <div data-testid="kanban-board">Board</div>,
}));
vi.mock("@/components/kanban/BoardCalendar", () => ({
  BoardCalendar: () => <div data-testid="board-calendar">Calendar</div>,
}));
vi.mock("@/components/kanban/BoardPlanningView", () => ({
  BoardPlanningView: () => <div data-testid="board-planning">Planning</div>,
}));
vi.mock("@/components/kanban/CardDetailDrawer", () => ({
  CardDetailDrawer: () => <div data-testid="card-drawer">Drawer</div>,
}));

describe("BoardDetailPage Edit Board Flow & Access Checks", () => {
  const defaultCardFilters: BoardCardFilters = {
    statusGroup: "ALL",
    priority: "ALL",
    assigneeIds: [],
    dueDate: "ALL",
    labelIds: [],
  };

  const mockBoard: BoardDetail = {
    id: "board-101",
    workspaceId: "ws-1",
    name: "Sprint Alpha",
    description: "Alpha release goals",
    status: "ACTIVE",
    members: [
      { id: "user-owner", name: "Alice Owner", initials: "AO", role: "MEMBER" },
    ],
    labels: [],
    lists: [],
    createdAt: "2026-10-10T00:00:00.000Z",
    updatedAt: "2026-10-10T00:00:00.000Z",
  };

  const createMockHookReturn = (
    overrides?: Partial<ReturnType<typeof hooksModule.useBoardDetail>>
  ): ReturnType<typeof hooksModule.useBoardDetail> =>
    ({
      board: mockBoard,
      filteredLists: [],
      allBoardCards: [],
      isLoading: false,
      error: null,
      reload: vi.fn(),
      wsStatus: "CONNECTED",
      isLive: true,
      searchQuery: "",
      setSearchQuery: vi.fn(),
      cardFilters: defaultCardFilters,
      setCardFilters: vi.fn(),
      activeView: "board",
      setActiveView: vi.fn(),
      selectedCardId: null,
      selectedCard: null,
      handleSelectCard: vi.fn(),
      handleCloseCardDetail: vi.fn(),
      handleUpdateBoard: vi.fn(),
      ...overrides,
    } as unknown as ReturnType<typeof hooksModule.useBoardDetail>);

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={["/boards/board-101"]}>
        <Routes>
          <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: {
        id: "user-owner",
        email: "owner@test.com",
        fullName: "Alice Owner",
        avatarUrl: null,
        status: "ACTIVE",
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-01T00:00:00.000Z",
      },
    });

    useWorkspaceStore.setState({
      workspaces: [
        {
          id: "ws-1",
          name: "Test Workspace",
          slug: "test-workspace",
          description: "Test description",
          teamType: "engineering",
          initials: "TW",
          status: "active",
          isFrozen: false,
        },
      ],
      activeWorkspaceId: "ws-1",
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    // Mock workspace ownership verification
    const mockMembersRes: ListWorkspaceMembersResponse = {
      items: [
        {
          id: "mem-1",
          workspaceId: "ws-1",
          userId: "user-owner",
          role: "OWNER",
          user: {
            id: "user-owner",
            fullName: "Alice Owner",
            email: "owner@test.com",
            status: "ACTIVE",
          },
          createdAt: "2026-10-01T00:00:00.000Z",
          updatedAt: "2026-10-01T00:00:00.000Z",
          endedAt: null,
        },
      ],
    };
    vi.spyOn(workspaceApi, "listWorkspaceMembers").mockResolvedValue(mockMembersRes);
  });

  it("allows Workspace Owner to open EditBoardModal, submit changes, and updates board metadata", async () => {
    let currentBoard = { ...mockBoard };
    const handleUpdateBoardMock = vi.fn().mockImplementation(async (payload) => {
      currentBoard = {
        ...currentBoard,
        name: payload.name ?? currentBoard.name,
        description: payload.description !== undefined ? payload.description : currentBoard.description,
      };
      return currentBoard;
    });

    vi.spyOn(hooksModule, "useBoardDetail").mockImplementation(() =>
      createMockHookReturn({
        board: currentBoard,
        handleUpdateBoard: handleUpdateBoardMock,
      })
    );

    renderPage();

    // Verify Board Title rendered
    expect(await screen.findByRole("heading", { name: "Sprint Alpha" })).toBeTruthy();

    // Open options dropdown
    const optionsButton = screen.getByRole("button", { name: /Board options/i });
    fireEvent.keyDown(optionsButton, { key: "Enter" });

    // Click Edit Board Details
    const editMenuItem = await screen.findByText(/Edit Board Details/i);
    fireEvent.click(editMenuItem);

    // EditBoardModal should appear
    expect(await screen.findByRole("dialog", { name: /Edit Board Details/i })).toBeTruthy();

    const nameInput = screen.getByLabelText(/Board Name/i);
    const descInput = screen.getByLabelText(/Description/i);

    expect((nameInput as HTMLInputElement).value).toBe("Sprint Alpha");
    expect((descInput as HTMLTextAreaElement).value).toBe("Alpha release goals");

    fireEvent.change(nameInput, { target: { value: "Sprint Alpha - Renamed" } });
    fireEvent.change(descInput, { target: { value: "Updated goals" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(handleUpdateBoardMock).toHaveBeenCalledWith({
        name: "Sprint Alpha - Renamed",
        description: "Updated goals",
      });
    });

    // Modal should close on success
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Edit Board Details/i })).toBeNull();
    });
  });

  it("disables edit action when the board is archived", async () => {
    const archivedBoard: BoardDetail = {
      ...mockBoard,
      status: "ARCHIVED",
    };

    vi.spyOn(hooksModule, "useBoardDetail").mockImplementation(() =>
      createMockHookReturn({
        board: archivedBoard,
      })
    );

    renderPage();

    const optionsButton = await screen.findByRole("button", { name: /Board options/i });
    fireEvent.keyDown(optionsButton, { key: "Enter" });

    const editMenuItemText = await screen.findByText(/Edit Board Details/i);
    const editMenuItem = editMenuItemText.closest("[role='menuitem']");
    expect(editMenuItem?.getAttribute("aria-disabled") === "true" || editMenuItem?.hasAttribute("disabled")).toBe(true);
    expect(editMenuItem?.getAttribute("title")).toBe("Cannot edit an archived board.");
  });

  it("disables edit action when the workspace is archived", async () => {
    useWorkspaceStore.setState({
      workspaces: [
        {
          id: "ws-1",
          name: "Archived Workspace",
          slug: "archived-ws",
          description: "",
          teamType: "engineering",
          initials: "AW",
          status: "archived",
          isFrozen: false,
        },
      ],
      activeWorkspaceId: "ws-1",
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    vi.spyOn(hooksModule, "useBoardDetail").mockImplementation(() =>
      createMockHookReturn({
        board: mockBoard,
      })
    );

    renderPage();

    const optionsButton = await screen.findByRole("button", { name: /Board options/i });
    fireEvent.keyDown(optionsButton, { key: "Enter" });

    const editMenuItemText = await screen.findByText(/Edit Board Details/i);
    const editMenuItem = editMenuItemText.closest("[role='menuitem']");
    expect(editMenuItem?.getAttribute("aria-disabled") === "true" || editMenuItem?.hasAttribute("disabled")).toBe(true);
    expect(editMenuItem?.getAttribute("title")).toBe("Cannot modify boards in an archived workspace.");
  });

  it("disables edit action when the workspace is frozen", async () => {
    useWorkspaceStore.setState({
      workspaces: [
        {
          id: "ws-1",
          name: "Frozen Workspace",
          slug: "frozen-ws",
          description: "",
          teamType: "engineering",
          initials: "FW",
          status: "active",
          isFrozen: true,
        },
      ],
      activeWorkspaceId: "ws-1",
      isLoading: false,
      error: null,
      isInitialized: true,
    });

    vi.spyOn(hooksModule, "useBoardDetail").mockImplementation(() =>
      createMockHookReturn({
        board: mockBoard,
      })
    );

    renderPage();

    const optionsButton = await screen.findByRole("button", { name: /Board options/i });
    fireEvent.keyDown(optionsButton, { key: "Enter" });

    const editMenuItemText = await screen.findByText(/Edit Board Details/i);
    const editMenuItem = editMenuItemText.closest("[role='menuitem']");
    expect(editMenuItem?.getAttribute("aria-disabled") === "true" || editMenuItem?.hasAttribute("disabled")).toBe(true);
    expect(editMenuItem?.getAttribute("title")).toBe("This workspace is frozen and cannot be modified.");
  });
});
