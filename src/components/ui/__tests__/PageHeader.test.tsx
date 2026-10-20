import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "@/components/ui/PageHeader";

describe("PageHeader", () => {
  it("renders the page title, description, and accessible actions", () => {
    render(
      <PageHeader
        title="Workspace members"
        description="Manage access to this workspace."
        actions={<button type="button">Invite member</button>}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Workspace members", level: 1 })
    ).toBeTruthy();
    expect(
      screen.getByText("Manage access to this workspace.")
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Invite member" })
    ).toBeTruthy();
  });

  it("stacks content and keeps actions available on narrow layouts", () => {
    render(
      <PageHeader
        title="Boards"
        actions={<button type="button">Create board</button>}
      />
    );

    const header = screen.getByRole("heading", { name: "Boards" }).closest("header");
    expect(header).not.toBeNull();
    if (!header) return;
    expect(header.className).toContain("flex-col");
    expect(header.className).toContain("sm:flex-row");
    expect(screen.getByRole("button", { name: "Create board" })).toBeTruthy();
  });
});
