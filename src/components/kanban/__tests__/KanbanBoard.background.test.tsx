import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KanbanBoard } from "../KanbanBoard";

vi.mock("@/hooks/useKanbanDnd", () => ({
  LIST_DROP_TARGET_PREFIX: "list-drop:",
  useKanbanDnd: () => ({
    sensors: [],
    activeCard: null,
    previewLists: [],
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragCancel: vi.fn(),
  }),
}));

describe("KanbanBoard background", () => {
  it("applies the selected preset to the board canvas", () => {
    render(
      <KanbanBoard
        lists={[]}
        backgroundPreset="coast"
        onCommitMoveCard={vi.fn()}
        onAddCard={vi.fn()}
        onAddColumn={vi.fn()}
      />
    );

    const canvas = screen.getByRole("region", { name: "Board canvas" });
    expect(canvas.getAttribute("style")).toContain("#c7e7e2");
    expect(canvas.className).toContain("rounded-3xl");
  });
});
