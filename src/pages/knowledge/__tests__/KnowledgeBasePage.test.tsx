import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { KnowledgeBasePage } from "../KnowledgeBasePage";

vi.mock("@/hooks", () => ({
  useWorkspaceBoards: () => ({
    boards: [
      { id: "b-1", title: "Core Platform" },
      { id: "b-2", title: "Website Redesign" },
    ],
    isLoading: false,
  }),
}));

describe("KnowledgeBasePage", () => {
  it("renders Knowledge Base header, tabs, and documents section", () => {
    render(
      <MemoryRouter>
        <KnowledgeBasePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Knowledge Base/i })).toBeDefined();
    expect(screen.getByText(/Project Documents & RAG/i)).toBeDefined();
    expect(screen.getByText(/Playbook & Guides/i)).toBeDefined();
    expect(screen.getByText(/Drag and drop project documents/i)).toBeDefined();
  });

  it("switches to Playbook & Guides tab when clicked", () => {
    render(
      <MemoryRouter>
        <KnowledgeBasePage />
      </MemoryRouter>
    );

    const playbookTabBtn = screen.getByRole("button", { name: /Playbook & Guides/i });
    fireEvent.click(playbookTabBtn);

    expect(screen.getByLabelText(/Search articles/i)).toBeDefined();
    expect(screen.getByText(/Filter by category/i)).toBeDefined();
  });
});
