import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BoardDetailToolbar } from "../BoardDetailToolbar";

describe("BoardDetailToolbar AI button", () => {
  it("renders AI Copilot button and triggers onToggleAiCopilot", () => {
    const onToggleAiCopilot = vi.fn();
    render(
      <BoardDetailToolbar
        activeView="board"
        onViewChange={vi.fn()}
        backgroundPreset="aurora"
        onBackgroundChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        filters={{
          statusGroup: "ALL",
          priority: "ALL",
          assigneeIds: [],
          dueDate: "ALL",
          labelIds: [],
        }}
        onFiltersChange={vi.fn()}
        members={[]}
        labels={[]}
        onToggleAiCopilot={onToggleAiCopilot}
      />
    );

    const btn = screen.getByRole("button", { name: /AI Copilot/i });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onToggleAiCopilot).toHaveBeenCalled();
  });
});
