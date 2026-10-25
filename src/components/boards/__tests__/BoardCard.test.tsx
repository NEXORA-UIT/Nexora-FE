import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoardCard } from "../BoardCard";
import type { Board } from "@/types";

vi.mock("../BoardActionMenu", () => ({
  BoardActionMenu: () => <button type="button" aria-label="Board actions" />,
}));

const board: Board = {
  id: "board-1",
  workspaceId: "workspace-1",
  name: "Product Roadmap",
  title: "Product Roadmap",
  description: "Plan the next product release.",
  status: "active",
  coverColor: "#2563EB",
  coverUrl: null,
  members: [
    { id: "member-1", name: "Alex Kim", initials: "AK" },
    { id: "member-2", name: "Sam Lee", initials: "SL" },
  ],
  updatedAt: "2026-10-24T10:00:00.000Z",
  createdAt: "2026-10-20T10:00:00.000Z",
};

describe("BoardCard", () => {
  it("shows the board cover, updated time, and member count in the card layout", () => {
    render(<BoardCard board={board} onClick={vi.fn()} />);

    expect(screen.getByTestId("board-card-cover").getAttribute("style")).toContain(
      "background-color: rgb(37, 99, 235)"
    );
    expect(screen.getByText(/Updated/)).toBeTruthy();
    expect(screen.getByText("2 members")).toBeTruthy();
  });
});
