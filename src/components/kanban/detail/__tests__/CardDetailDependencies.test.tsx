import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CardDetailDependencies } from "../CardDetailDependencies";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";
import type { KanbanCard } from "@/types";

describe("CardDetailDependencies Component", () => {
  const card101 = MOCK_BOARD_DETAIL.lists[0].cards.find((c) => c.id === "card-101")!;
  const allCards: KanbanCard[] = MOCK_BOARD_DETAIL.lists.flatMap((l) => l.cards);

  it("renders prerequisites list and delete button for authorized manager", () => {
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <CardDetailDependencies
        card={card101}
        boardCards={allCards}
        canManage={true}
        onDeleteDependency={handleDelete}
      />
    );

    // Prerequisite item NEX-107 should be visible
    expect(screen.getByText("NEX-107")).toBeDefined();

    // Delete button should exist
    const deleteBtn = screen.getByRole("button", { name: /Remove dependency NEX-107/i });
    expect(deleteBtn).toBeDefined();

    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(card101.dependencies![0].id);
  });

  it("hides Add and Delete actions when canManage is false", () => {
    render(
      <CardDetailDependencies
        card={card101}
        boardCards={allCards}
        canManage={false}
        onAddDependency={vi.fn()}
        onDeleteDependency={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /Add dependency/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Remove dependency/i })).toBeNull();
  });

  it("opens AddDependencyDialog and submits selected prerequisite", async () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    render(
      <CardDetailDependencies
        card={card101}
        boardCards={allCards}
        canManage={true}
        onAddDependency={handleAdd}
      />
    );

    const addBtn = screen.getByRole("button", { name: /Add dependency/i });
    fireEvent.click(addBtn);

    // Dialog should open
    expect(screen.getByText("Add Prerequisite Dependency")).toBeDefined();

    // Find an available candidate card (e.g., NEX-102)
    const candidateBtn = screen.getByText("NEX-102").closest("button");
    expect(candidateBtn).toBeDefined();

    fireEvent.click(candidateBtn!);

    // Submit
    const submitBtn = screen.getByRole("button", { name: "Add Dependency" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleAdd).toHaveBeenCalledWith("card-102");
    });
  });
});
