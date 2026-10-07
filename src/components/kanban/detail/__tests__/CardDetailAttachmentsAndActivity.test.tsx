import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CardDetailAttachments } from "../CardDetailAttachments";
import { CardDetailActivity } from "../CardDetailActivity";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

describe("CardDetailAttachments & CardDetailActivity", () => {
  const card101 = MOCK_BOARD_DETAIL.lists[0].cards.find((c) => c.id === "card-101")!;

  it("renders attachments list and disabled upload indicator", () => {
    render(<CardDetailAttachments card={card101} />);

    expect(screen.getByText(/Attachments/i)).toBeDefined();
    expect(screen.getByText("copydeck_v2.docx")).toBeDefined();
    expect(screen.getByText("landing-mockup.png")).toBeDefined();
    expect(screen.getByText("+ Upload")).toBeDefined();
  });

  it("renders comments by default and lazy-loads activity when switching tab", async () => {
    const handleAddComment = vi.fn();
    const handleFetchActivities = vi.fn().mockResolvedValue([
      {
        id: "act-1",
        cardId: "card-101",
        user: { id: "m-1", name: "Phan Gia Đạt", initials: "Đ", role: "PM" },
        action: "updated status to IN PROGRESS",
        createdAt: "2026-09-20T10:00:00.000Z",
      },
    ]);

    render(
      <CardDetailActivity
        card={card101}
        onAddComment={handleAddComment}
        onFetchActivities={handleFetchActivities}
      />
    );

    // Initial tab: Comments
    expect(screen.getByText(/Comments/i)).toBeDefined();
    expect(screen.getByText(/Initial draft is ready for review/i)).toBeDefined();
    // Activities should not be called yet
    expect(handleFetchActivities).not.toHaveBeenCalled();

    // Click Activity tab
    const activityTab = screen.getByRole("tab", { name: /Activity/i });
    fireEvent.click(activityTab);

    // Should trigger lazy load
    await waitFor(() => {
      expect(handleFetchActivities).toHaveBeenCalledWith("card-101");
      expect(screen.getByText(/updated status to IN PROGRESS/i)).toBeDefined();
    });
  });

  it("submits comment using Ctrl+Enter shortcut and validates non-empty content", async () => {
    const handleAddComment = vi.fn().mockResolvedValue(undefined);
    const handleFetchActivities = vi.fn();

    render(
      <CardDetailActivity
        card={card101}
        onAddComment={handleAddComment}
        onFetchActivities={handleFetchActivities}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Send comment/i });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);

    const textarea = screen.getByRole("textbox", { name: /Write a comment/i });
    fireEvent.change(textarea, { target: { value: "A new constructive remark" } });
    expect(submitBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    expect(handleAddComment).toHaveBeenCalledWith("card-101", "A new constructive remark");
  });
});
