import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkspaceTabs } from "../WorkspaceTabs";

describe("WorkspaceTabs", () => {
  it("keeps keyboard focus visible on every tab", () => {
    render(<WorkspaceTabs activeTab="overview" onTabChange={vi.fn()} boardCount={2} memberCount={3} />);

    for (const tab of screen.getAllByRole("button")) {
      expect(tab.className).toMatch(/focus-visible:ring-2/);
    }
  });
});
