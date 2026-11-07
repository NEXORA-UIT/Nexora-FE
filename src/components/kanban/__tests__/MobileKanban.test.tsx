import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileColumnSelector } from "../MobileColumnSelector";
import type { KanbanList } from "@/types";

describe("MobileColumnSelector", () => {
  const mockLists = [
    { id: "col-1", name: "To Do", cards: [{ id: "c1" }] },
    { id: "col-2", name: "In Progress", cards: [] },
  ] as unknown as KanbanList[];

  it("renders list pills with card count and notifies on selection", () => {
    const handleSelect = vi.fn();
    render(
      <MobileColumnSelector
        lists={mockLists}
        activeListId="col-1"
        onSelect={handleSelect}
      />
    );

    expect(screen.getByText("To Do")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
    fireEvent.click(screen.getByText("In Progress"));
    expect(handleSelect).toHaveBeenCalledWith("col-2");
  });
});
