import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { Topbar } from "../Topbar";
import { useWorkspaceStore } from "@/stores/workspace.store";

function CurrentPath() {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
}

function renderNavigation() {
  return render(<MemoryRouter initialEntries={["/home"]}><CurrentPath /><Topbar /><Sidebar /></MemoryRouter>);
}

describe("app navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.getState().resetWorkspaceState();
    useWorkspaceStore.setState({
      isInitialized: true,
      isLoading: false,
      workspaces: [{
        id: "workspace-1", name: "Core Platform", slug: "core-platform", status: "active",
        description: "", teamType: "Software Engineering", initials: "CP",
      }],
      activeWorkspaceId: "workspace-1",
    });
  });

  it("links each product area to its real route and marks AI unavailable", () => {
    renderNavigation();

    expect(screen.getByRole("link", { name: "Boards" }).getAttribute("href")).toBe("/boards");
    expect(screen.getByRole("link", { name: "My Tasks" }).getAttribute("href")).toBe("/tasks");
    expect(screen.getByRole("link", { name: "Calendar" }).getAttribute("href")).toBe("/calendar");
    expect(screen.getByRole("link", { name: "Quick Notes" }).getAttribute("href")).toBe("/quick-notes");
    expect(screen.getByRole("link", { name: "Knowledge Base" }).getAttribute("href")).toBe("/knowledge");
    expect(screen.getByRole("link", { name: "Help & Docs" }).getAttribute("href")).toBe("/help");
    expect(screen.getByRole("link", { name: /AI Assistant.*not implemented/i }).getAttribute("href")).toBe("/assistant");
  });

  it("routes Create to Boards and has no inert global search or notification control", () => {
    renderNavigation();

    fireEvent.click(screen.getByRole("button", { name: /create board/i }));
    expect(screen.getByTestId("current-path").textContent).toBe("/boards");
    expect(screen.queryByPlaceholderText(/search projects/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /notifications/i })).toBeNull();
  });
});
