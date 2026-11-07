import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoardDetailToolbar } from "../BoardDetailToolbar";

describe("BoardDetailToolbar mobile responsiveness", () => {
  it("renders compact controls and accessible view buttons", () => {
    render(
      <BoardDetailToolbar
        activeView="board"
        onViewChange={vi.fn()}
        backgroundPreset="aurora"
        onBackgroundChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        filters={{ priority: "ALL", statusGroup: "ALL", labelIds: [], assigneeIds: [], dueDate: "ALL" }}
        onFiltersChange={vi.fn()}
        members={[]}
        labels={[]}
      />
    );

    expect(screen.getByRole("button", { name: /board/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /calendar/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /planning/i })).toBeDefined();
  });
});
