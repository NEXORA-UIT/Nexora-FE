import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardDetailHeader } from "../CardDetailHeader";
import { CardDetailMetadata } from "../CardDetailMetadata";
import { MOCK_BOARD_DETAIL, MOCK_BOARD_MEMBERS } from "@/mocks/data/kanban.mock";
import type { BoardLabel } from "@/types";

describe("CardDetailHeader & CardDetailMetadata", () => {
  const card = MOCK_BOARD_DETAIL.lists[0].cards[0];

  it("renders card code and title", () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();
    const handleClose = vi.fn();

    render(
      <CardDetailHeader
        card={card}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    );

    expect(screen.getByText(card.code)).toBeDefined();
    expect(screen.getByText(card.title)).toBeDefined();
  });

  it("renders status, priority, and assignees in metadata", () => {
    const handleStatusChange = vi.fn();
    const handleUpdate = vi.fn();

    render(
      <CardDetailMetadata
        card={card}
        lists={MOCK_BOARD_DETAIL.lists}
        members={MOCK_BOARD_MEMBERS}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdate}
      />
    );

    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("Priority")).toBeDefined();
    expect(screen.getByText("Assignee")).toBeDefined();
    expect(screen.getByText("Due date")).toBeDefined();
  });
  it("allows title editing and commits on Enter", async () => {
    const handleUpdate = vi.fn().mockResolvedValue(undefined);
    const handleDelete = vi.fn();
    const handleClose = vi.fn();

    render(
      <CardDetailHeader
        card={card}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    );

    const titleHeading = screen.getByText(card.title);
    fireEvent.click(titleHeading);

    const titleInput = screen.getByRole("textbox", { name: /Card title/i });
    expect(titleInput).toBeDefined();

    fireEvent.change(titleInput, { target: { value: "Updated task title" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });

    expect(handleUpdate).toHaveBeenCalledWith({
      title: "Updated task title",
      updatedAt: card.updatedAt,
    });
  });

  it("opens delete confirmation modal and commits on confirm", async () => {
    const handleUpdate = vi.fn();
    const handleDelete = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <CardDetailHeader
        card={card}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    );

    // Open dropdown menu via keyboard or pointerDown for Radix UI
    const menuBtn = screen.getByRole("button", { name: /More card actions/i });
    fireEvent.keyDown(menuBtn, { key: "Enter" });

    // Click Delete in menu
    const deleteMenuItem = await screen.findByText("Delete card");
    fireEvent.click(deleteMenuItem);

    // Confirmation dialog should be visible
    expect(screen.getByText("Delete card?")).toBeDefined();
    expect(
      screen.getByText(/This will permanently remove the card from the board/i)
    ).toBeDefined();

    // Click Confirm Delete in dialog
    const confirmButtons = screen.getAllByRole("button", { name: /Delete card/i });
    // The button inside dialog
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    expect(handleDelete).toHaveBeenCalledWith(card.id);
  });

  describe("Assignee Dropdown & Interaction", () => {
    it("renders Unassigned button when card has no assignees", () => {
      const cardUnassigned = { ...card, assignees: [] };
      render(
        <CardDetailMetadata
          card={cardUnassigned}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /Assign member/i });
      expect(trigger).toBeDefined();
      expect(trigger.textContent).toContain("Unassigned");
    });

    it("renders single assignee name and initials", () => {
      const cardSingle = { ...card, assignees: [MOCK_BOARD_MEMBERS[1]] };
      render(
        <CardDetailMetadata
          card={cardSingle}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /Assign member/i });
      expect(trigger.textContent).toContain("Emily Quinn");
    });

    it("renders multi-assignee counter when card has multiple assignees", () => {
      const cardMulti = {
        ...card,
        assignees: [MOCK_BOARD_MEMBERS[1], MOCK_BOARD_MEMBERS[2]],
      };
      render(
        <CardDetailMetadata
          card={cardMulti}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /Assign member/i });
      expect(trigger.textContent).toContain("Emily Quinn");
      expect(trigger.textContent).toContain("+1");
    });

    it("opens dropdown, renders members, and toggles assignment on click", async () => {
      const cardUnassigned = { ...card, assignees: [] };
      const handleAssign = vi.fn().mockResolvedValue(undefined);
      const handleUnassign = vi.fn().mockResolvedValue(undefined);

      render(
        <CardDetailMetadata
          card={cardUnassigned}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          onAssignMember={handleAssign}
          onUnassignMember={handleUnassign}
        />
      );

      const trigger = screen.getByRole("button", { name: /Assign member/i });
      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(await screen.findByText("Assign Members")).toBeDefined();

      // Click unassigned member -> calls onAssignMember
      const emilyItem = screen.getByRole("menuitem", { name: /Emily Quinn/i });
      fireEvent.click(emilyItem);

      expect(handleAssign).toHaveBeenCalledWith(cardUnassigned.id, "m-2");
      expect(handleUnassign).not.toHaveBeenCalled();
    });

    it("clicking assigned member in dropdown calls onUnassignMember", async () => {
      const cardAssigned = { ...card, assignees: [MOCK_BOARD_MEMBERS[1]] };
      const handleAssign = vi.fn().mockResolvedValue(undefined);
      const handleUnassign = vi.fn().mockResolvedValue(undefined);

      render(
        <CardDetailMetadata
          card={cardAssigned}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          onAssignMember={handleAssign}
          onUnassignMember={handleUnassign}
        />
      );

      const trigger = screen.getByRole("button", { name: /Assign member/i });
      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(await screen.findByText("Assign Members")).toBeDefined();

      // Emily Quinn is assigned -> click calls onUnassignMember
      const emilyItem = screen.getByRole("menuitem", { name: /Emily Quinn/i });
      fireEvent.click(emilyItem);

      expect(handleUnassign).toHaveBeenCalledWith(cardAssigned.id, "m-2");
      expect(handleAssign).not.toHaveBeenCalled();
    });

    it("disables trigger when isLoadingAssignments is true", () => {
      render(
        <CardDetailMetadata
          card={card}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          isLoadingAssignments={true}
        />
      );

      const trigger = screen.getByRole("button", { name: /Assign member/i });
      expect((trigger as HTMLButtonElement).disabled).toBe(true);
    });

    it("renders assignment error banner and invokes retry callback", () => {
      const handleRetry = vi.fn();
      render(
        <CardDetailMetadata
          card={card}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          assignmentsError="Failed to load assignments"
          onRetryAssignments={handleRetry}
        />
      );

      expect(screen.getByText("Failed to load assignments")).toBeDefined();
      const retryBtn = screen.getByRole("button", { name: /Retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });
  });

  describe("Label Dropdown & Interaction", () => {
    const mockBoardLabels: BoardLabel[] = [
      { id: "lbl-1", boardId: "b-1", name: "Bug", color: "#ef4444" },
      { id: "lbl-2", boardId: "b-1", name: "Feature", color: "#3b82f6" },
    ];

    it("renders existing label chips with colors", () => {
      const cardWithLabels = {
        ...card,
        labels: [{ id: "lbl-1", boardId: "b-1", name: "Bug", color: "#ef4444" }],
      };

      render(
        <CardDetailMetadata
          card={cardWithLabels}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          boardLabels={mockBoardLabels}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      expect(screen.getByText("Bug")).toBeDefined();
    });

    it("opens dropdown and clicking unattached label calls onAttachLabel", async () => {
      const cardWithLabels = {
        ...card,
        labels: [{ id: "lbl-1", boardId: "b-1", name: "Bug", color: "#ef4444" }],
      };
      const handleAttach = vi.fn().mockResolvedValue(undefined);
      const handleDetach = vi.fn().mockResolvedValue(undefined);

      render(
        <CardDetailMetadata
          card={cardWithLabels}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          boardLabels={mockBoardLabels}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          onAttachLabel={handleAttach}
          onDetachLabel={handleDetach}
        />
      );

      const trigger = screen.getByRole("button", { name: /Manage labels/i });
      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(await screen.findByText("Board Labels")).toBeDefined();

      // "Feature" is not attached -> click calls onAttachLabel
      const featureItem = screen.getByRole("menuitem", { name: /Feature/i });
      fireEvent.click(featureItem);
      expect(handleAttach).toHaveBeenCalledWith(cardWithLabels.id, "lbl-2");
      expect(handleDetach).not.toHaveBeenCalled();
    });

    it("clicking attached label in dropdown calls onDetachLabel", async () => {
      const cardWithLabels = {
        ...card,
        labels: [{ id: "lbl-1", boardId: "b-1", name: "Bug", color: "#ef4444" }],
      };
      const handleAttach = vi.fn().mockResolvedValue(undefined);
      const handleDetach = vi.fn().mockResolvedValue(undefined);

      render(
        <CardDetailMetadata
          card={cardWithLabels}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          boardLabels={mockBoardLabels}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          onAttachLabel={handleAttach}
          onDetachLabel={handleDetach}
        />
      );

      const trigger = screen.getByRole("button", { name: /Manage labels/i });
      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(await screen.findByText("Board Labels")).toBeDefined();

      // "Bug" is attached -> click calls onDetachLabel
      const bugItem = screen.getByRole("menuitem", { name: /Bug/i });
      fireEvent.click(bugItem);
      expect(handleDetach).toHaveBeenCalledWith(cardWithLabels.id, "lbl-1");
      expect(handleAttach).not.toHaveBeenCalled();
    });

    it("disables trigger when isLoadingLabels is true", () => {
      render(
        <CardDetailMetadata
          card={card}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          boardLabels={mockBoardLabels}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          isLoadingLabels={true}
        />
      );

      const trigger = screen.getByRole("button", { name: /Manage labels/i });
      expect((trigger as HTMLButtonElement).disabled).toBe(true);
    });

    it("renders label error banner and invokes retry callback", () => {
      const handleRetry = vi.fn();
      render(
        <CardDetailMetadata
          card={card}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          boardLabels={mockBoardLabels}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
          labelsError="Failed to load labels"
          onRetryLabels={handleRetry}
        />
      );

      expect(screen.getByText("Failed to load labels")).toBeDefined();
      const retryBtn = screen.getByRole("button", { name: /Retry/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });

    it("renders empty state when board has no labels", async () => {
      render(
        <CardDetailMetadata
          card={card}
          lists={MOCK_BOARD_DETAIL.lists}
          members={MOCK_BOARD_MEMBERS}
          boardLabels={[]}
          onStatusChange={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /Manage labels/i });
      fireEvent.keyDown(trigger, { key: "Enter" });

      expect(await screen.findByText("No board labels available")).toBeDefined();
    });
  });
});
