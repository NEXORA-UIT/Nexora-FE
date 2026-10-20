import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BoardDetailToolbar } from "../BoardDetailToolbar";
import type { BoardCardFilters } from "@/types";

describe("BoardDetailToolbar filters", () => {
  it("opens filters and reports selected priority to the parent", () => {
    const filters: BoardCardFilters = {
      statusGroup: "ALL",
      priority: "ALL",
      assigneeIds: [],
      dueDate: "ALL",
      labelIds: [],
    };
    const onFiltersChange = vi.fn();
    render(
      <BoardDetailToolbar
        activeView="board"
        onViewChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        filters={filters}
        onFiltersChange={onFiltersChange}
        members={[]}
        labels={[]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    expect(screen.getByRole("region", { name: "Card filters" })).toBeDefined();
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by priority" }), {
      target: { value: "URGENT" },
    });
    expect(onFiltersChange).toHaveBeenCalledWith({ ...filters, priority: "URGENT" });
  });

  it("offers board labels as a filter", () => {
    const filters: BoardCardFilters = {
      statusGroup: "ALL",
      priority: "ALL",
      assigneeIds: [],
      dueDate: "ALL",
      labelIds: [],
    };
    const onFiltersChange = vi.fn();
    render(
      <BoardDetailToolbar
        activeView="board"
        onViewChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        filters={filters}
        onFiltersChange={onFiltersChange}
        members={[]}
        labels={[{ id: "label-1", boardId: "board-1", name: "Bug" }]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Filter" }));
    const labelSelect = screen.getByRole("listbox", { name: "Filter by label" }) as HTMLSelectElement;
    labelSelect.options[0]!.selected = true;
    fireEvent.change(labelSelect);
    expect(onFiltersChange).toHaveBeenCalledWith({ ...filters, labelIds: ["label-1"] });
  });
});
