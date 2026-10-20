import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QuickNotesPage } from "../QuickNotesPage";
import { useQuickNotes } from "@/hooks";

const mocks = vi.hoisted(() => ({
  create: vi.fn(), update: vi.fn(), remove: vi.fn(), convert: vi.fn(), reload: vi.fn(),
  loadBoardLists: vi.fn(), useQuickNotes: vi.fn(),
}));
vi.mock("@/hooks", () => ({ useQuickNotes: mocks.useQuickNotes }));

const note = {
  id: "note-1", userId: "user-1", content: "Ghi nhớ tên Workspace của khách hàng",
  createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-02T00:00:00.000Z",
  convertedAt: null, convertedCardId: null,
};

function CurrentPath() {
  return <span data-testid="current-path">{useLocation().pathname}</span>;
}

function renderPage() {
  return render(<MemoryRouter initialEntries={["/quick-notes"]}><CurrentPath /><QuickNotesPage /></MemoryRouter>);
}

describe("QuickNotesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuickNotes).mockReturnValue({
      workspace: { id: "workspace-1", name: "Nexora Team" },
      notes: [note],
      boards: [{ id: "board-1", name: "Product roadmap" }],
      lists: [{ id: "list-1", boardId: "board-1", name: "To Do" }],
      isLoading: false,
      error: null,
      reload: mocks.reload,
      loadBoardLists: mocks.loadBoardLists,
      create: mocks.create,
      update: mocks.update,
      remove: mocks.remove,
      convert: mocks.convert,
    } as unknown as ReturnType<typeof useQuickNotes>);
  });

  it("keeps note content intact and creates notes through English controls", async () => {
    mocks.create.mockResolvedValueOnce({ id: "note-2" });
    renderPage();

    expect(screen.getByRole("heading", { name: "Quick notes" })).toBeDefined();
    expect(screen.getByLabelText("New note")).toBeDefined();
    expect(screen.getByLabelText("Note content")).toHaveProperty("value", note.content);
    expect(screen.getByText("Nexora Team")).toBeDefined();
    fireEvent.change(screen.getByLabelText("New note"), { target: { value: "Capture onboarding feedback" } });
    fireEvent.click(screen.getByRole("button", { name: /Save note/i }));

    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith("Capture onboarding feedback"));
  });

  it("shows an error and retry instead of claiming the user has no notes", () => {
    vi.mocked(useQuickNotes).mockReturnValue({
      workspace: { id: "workspace-1", name: "Nexora Team" }, notes: [], boards: [], lists: [],
      isLoading: false, error: "Could not load notes.", reload: mocks.reload,
      loadBoardLists: mocks.loadBoardLists, create: mocks.create, update: mocks.update,
      remove: mocks.remove, convert: mocks.convert,
    } as unknown as ReturnType<typeof useQuickNotes>);
    renderPage();

    expect(screen.getByRole("alert").textContent).toContain("Could not load notes.");
    expect(screen.queryByText(/do not have any notes/i)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(mocks.reload).toHaveBeenCalledOnce();
  });

  it("converts a note using the selected Board and List IDs", async () => {
    mocks.convert.mockResolvedValueOnce({ card: { boardId: "board-1", id: "card-1" } });
    renderPage();

    fireEvent.change(screen.getByLabelText("Board"), { target: { value: "board-1" } });
    fireEvent.change(screen.getByLabelText("List"), { target: { value: "list-1" } });
    fireEvent.click(screen.getByRole("button", { name: /convert to card/i }));

    await waitFor(() => expect(mocks.convert).toHaveBeenCalledWith("note-1", "board-1", "list-1"));
    expect(screen.getByTestId("current-path").textContent).toBe("/boards/board-1");
  });
});
