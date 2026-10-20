import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardGitActivityTab } from "../CardGitActivityTab";
import type { GitActivityItem } from "@/types";

const activity: GitActivityItem = {
  id: "commit-1",
  cardId: "card-1",
  type: "COMMIT",
  identifier: "8f2c1ab",
  message: "feat: link commit #NEX-101",
  author: "datphan",
  url: "https://github.com/nexora/app/commit/8f2c1ab",
  timestamp: "2026-10-15T09:30:00.000Z",
};

describe("CardGitActivityTab", () => {
  it("shows demo status and opens GitHub activity in a new tab", () => {
    render(
      <CardGitActivityTab
        items={[activity]}
        source="DEMO"
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText(/Demo data/)).toBeDefined();
    expect(screen.getByText(activity.message)).toBeDefined();
    expect(screen.getByRole("link", { name: activity.identifier }).getAttribute("target")).toBe(
      "_blank"
    );
  });

  it("explains the card reference syntax when there is no Git activity", () => {
    render(
      <CardGitActivityTab
        items={[]}
        source="API"
        isLoading={false}
        error={null}
        onRetry={vi.fn()}
      />
    );
    expect(screen.getByText(/#NEX-xxx/)).toBeDefined();
  });
});
