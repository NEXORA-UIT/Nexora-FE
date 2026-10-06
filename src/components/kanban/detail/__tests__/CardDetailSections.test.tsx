import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardDetailDescription } from "../CardDetailDescription";
import { CardDetailChecklist } from "../CardDetailChecklist";
import { CardDetailDependencies } from "../CardDetailDependencies";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

describe("Card Detail Content Sections", () => {
  const card101 = MOCK_BOARD_DETAIL.lists[0].cards.find((c) => c.id === "card-101")!;
  const card103 = MOCK_BOARD_DETAIL.lists[0].cards.find((c) => c.id === "card-103")!;

  it("renders Description and handles input change", () => {
    const handleUpdate = vi.fn();
    render(<CardDetailDescription card={card101} onUpdate={handleUpdate} />);

    const textarea = screen.getByPlaceholderText(/Add a detailed description/i);
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: "New draft description" } });
    expect(screen.getByText("Unsaved changes...")).toBeDefined();
  });

  it("renders Checklist progress and tasks", () => {
    const handleAdd = vi.fn();
    const handleToggle = vi.fn();
    const handleDelete = vi.fn();

    render(
      <CardDetailChecklist
        card={card101}
        onAddItem={handleAdd}
        onToggleItem={handleToggle}
        onDeleteItem={handleDelete}
      />
    );

    expect(screen.getByText(/Checklist/i)).toBeDefined();
    expect(screen.getByText("Draft quotes")).toBeDefined();
    expect(screen.getByText("Legal review")).toBeDefined();
  });

  it("does NOT show blocked alert for card-101 with completed prerequisite", () => {
    render(<CardDetailDependencies card={card101} />);
    expect(screen.queryByText(/Blocked by an incomplete prerequisite/i)).toBeNull();
    expect(screen.getByText("NEX-107")).toBeDefined();
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("SHOWS blocked alert for card-103 with incomplete prerequisite", () => {
    render(<CardDetailDependencies card={card103} />);
    expect(screen.getByText(/Blocked by an incomplete prerequisite/i)).toBeDefined();
    expect(screen.getByText("NEX-102")).toBeDefined();
    expect(screen.getByText("In Progress")).toBeDefined();
  });
});
