import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ApiError } from "@/apis/client";
import { CreateBoardModal } from "../CreateBoardModal";

describe("CreateBoardModal", () => {
  it("uses an English fallback for server errors and keeps submitted Board names intact", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(
      new ApiError("Không thể tạo Board", "BOARD_CREATE_FAILED", 400)
    );
    render(
      <CreateBoardModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
        workspaceId="workspace-1"
        isSubmitting={false}
      />
    );

    fireEvent.change(screen.getByLabelText(/Board Title/i), {
      target: { value: "Lộ trình khách hàng" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Board" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create board.")).toBeTruthy();
    });
    expect(onSubmit).toHaveBeenCalledWith({
      workspaceId: "workspace-1",
      name: "Lộ trình khách hàng",
      description: "",
    });
    expect(screen.queryByText("Không thể tạo Board")).toBeNull();
  });
});
