import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MobileNavDrawer } from "../MobileNavDrawer";

describe("MobileNavDrawer", () => {
  it("renders workspace selector and navigation links when open", () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <MobileNavDrawer isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Workspaces")).toBeDefined();
    expect(screen.getByText("Knowledge Base")).toBeDefined();
    expect(screen.getByText("Help & Guides")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });
});
