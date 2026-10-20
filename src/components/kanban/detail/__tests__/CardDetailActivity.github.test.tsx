import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CardDetailActivity } from "../CardDetailActivity";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

describe("CardDetailActivity Git tab", () => {
  it("loads Git activity when the Code / Git tab opens", async () => {
    const card = MOCK_BOARD_DETAIL.lists[0].cards[0]!;
    const fetchGitActivity = vi.fn().mockResolvedValue({ items: [], source: "DEMO" });
    render(
      <CardDetailActivity
        card={card}
        onAddComment={vi.fn()}
        onFetchActivities={vi.fn().mockResolvedValue([])}
        onFetchGitActivity={fetchGitActivity}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: "Code / Git" }));

    await waitFor(() => expect(fetchGitActivity).toHaveBeenCalledWith(card.id, card.code));
    expect(await screen.findByText(/#NEX-xxx/)).toBeDefined();
  });
});
