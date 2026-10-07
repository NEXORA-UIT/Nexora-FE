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

  it("commits description immediately on blur", async () => {
    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    render(<CardDetailDescription card={card101} onUpdate={handleUpdate} />);

    const textarea = screen.getByPlaceholderText(/Add a detailed description/i);
    fireEvent.change(textarea, { target: { value: "Immediate blur save test" } });
    fireEvent.blur(textarea);

    expect(handleUpdate).toHaveBeenCalledWith({
      description: "Immediate blur save test",
      updatedAt: card101.updatedAt,
    });
  });

  it("handles description save failure and retries on button click", async () => {
    const handleUpdate = vi.fn().mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce(undefined);
    render(<CardDetailDescription card={card101} onUpdate={handleUpdate} />);

    const textarea = screen.getByPlaceholderText(/Add a detailed description/i);
    fireEvent.change(textarea, { target: { value: "Failing text" } });
    fireEvent.blur(textarea);

    // Should show error state
    const errorText = await screen.findByText(/Unable to save changes/i);
    expect(errorText).toBeDefined();

    // Click retry
    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    fireEvent.click(retryBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(2);
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

  it("renders empty checklist helper state when checklist is empty", () => {
    const emptyCard = { ...card101, checklist: [] };
    render(
      <CardDetailChecklist
        card={emptyCard}
        onAddItem={vi.fn()}
        onToggleItem={vi.fn()}
        onDeleteItem={vi.fn()}
      />
    );

    expect(screen.getByText("No checklist items yet.")).toBeDefined();
    expect(screen.getByText(/Add a task to break this card into smaller steps/i)).toBeDefined();
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
