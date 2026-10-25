import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/apis/client";
import { EditBoardModal } from "../EditBoardModal";

describe("EditBoardModal", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(
      <EditBoardModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialName="Core Sprint"
        initialDescription="Sprint tracking"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders with initial board name and description when isOpen is true", () => {
    render(
      <EditBoardModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialName="Core Sprint"
        initialDescription="Sprint tracking"
      />
    );

    const nameInput = screen.getByLabelText(/Board Name/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;

    expect(nameInput.value).toBe("Core Sprint");
    expect(descInput.value).toBe("Sprint tracking");
  });

  it("submits valid updated name and trimmed description, and closes on success", async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValueOnce(undefined);

    render(
      <EditBoardModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialName="Old Name"
        initialDescription="Old Description"
      />
    );

    const nameInput = screen.getByLabelText(/Board Name/i);
    const descInput = screen.getByLabelText(/Description/i);

    fireEvent.change(nameInput, { target: { value: "New Board Name" } });
    fireEvent.change(descInput, { target: { value: "New detailed description" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "New Board Name",
        description: "New detailed description",
      });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("normalizes empty or whitespace description to null", async () => {
    const onSubmit = vi.fn().mockResolvedValueOnce(undefined);
    const onClose = vi.fn();

    render(
      <EditBoardModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialName="Old Name"
        initialDescription="Existing Description"
      />
    );

    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: "    " } });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Old Name",
        description: null,
      });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("rejects submission when board name is empty or only whitespace", async () => {
    const onSubmit = vi.fn();

    render(
      <EditBoardModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        initialName="Old Name"
      />
    );

    const nameInput = screen.getByLabelText(/Board Name/i);
    fireEvent.change(nameInput, { target: { value: "   " } });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(screen.getByText(/Please provide a board name/i)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects submission when board name exceeds 120 characters", async () => {
    const onSubmit = vi.fn();

    render(
      <EditBoardModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        initialName="Old Name"
      />
    );

    const nameInput = screen.getByLabelText(/Board Name/i);
    fireEvent.change(nameInput, { target: { value: "a".repeat(121) } });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(screen.getByText(/Board name must not exceed 120 characters/i)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects submission when description exceeds 2000 characters", async () => {
    const onSubmit = vi.fn();

    render(
      <EditBoardModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        initialName="Old Name"
      />
    );

    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: "a".repeat(2001) } });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    expect(screen.getByText(/Description must not exceed 2000 characters/i)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("retains input values and displays error message without closing dialog when onSubmit fails", async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockRejectedValueOnce(
      new ApiError("This workspace is frozen and cannot be modified.", "WORKSPACE_FROZEN", 403)
    );

    render(
      <EditBoardModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialName="Current Name"
        initialDescription="Current Description"
      />
    );

    const nameInput = screen.getByLabelText(/Board Name/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: "Attempted Name" } });
    fireEvent.change(descInput, { target: { value: "Attempted Description" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/This workspace is frozen and cannot be modified/i)).toBeTruthy();
    });

    // Inputs must NOT be lost or reset on error
    expect(nameInput.value).toBe("Attempted Name");
    expect(descInput.value).toBe("Attempted Description");
    // Modal must NOT close on failure
    expect(onClose).not.toHaveBeenCalled();
  });

  it("resets inputs to new initial values when isOpen toggles to true", () => {
    const { rerender } = render(
      <EditBoardModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialName="Board 1"
        initialDescription="Desc 1"
      />
    );

    rerender(
      <EditBoardModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialName="Board 2"
        initialDescription="Desc 2"
      />
    );

    const nameInput = screen.getByLabelText(/Board Name/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;

    expect(nameInput.value).toBe("Board 2");
    expect(descInput.value).toBe("Desc 2");
  });
});
