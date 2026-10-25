import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BoardSettingsDialog } from "../BoardSettingsDialog";
import type { BoardDetail } from "@/types";

const board = {
  id: "board-1",
  workspaceId: "workspace-1",
  name: "Sprint Planning",
  description: "Plan this sprint",
  status: "ACTIVE",
  members: [],
  labels: [],
  lists: [],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
} as BoardDetail;

describe("BoardSettingsDialog", () => {
  it("submits edited Board name and description", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <BoardSettingsDialog
        board={board}
        isOpen
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByLabelText("Board name"), {
      target: { value: "Release Planning" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Plan the next release" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith({
      name: "Release Planning",
      description: "Plan the next release",
    });
  });
});
