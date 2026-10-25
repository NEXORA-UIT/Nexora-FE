import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { WorkspaceHeader } from "../WorkspaceHeader";
import type { Workspace } from "@/types";

const workspace: Workspace = {
  id: "workspace-1",
  name: "Product Team",
  slug: "product-team",
  status: "active",
  description: "Plan product work.",
  teamType: "Product",
  initials: "PT",
};

describe("WorkspaceHeader leave action", () => {
  it("lets a Workspace member leave from Workspace options", async () => {
    const onLeaveClick = vi.fn();
    render(
      <WorkspaceHeader
        workspace={workspace}
        onCreateBoardClick={vi.fn()}
        canLeaveWorkspace
        onLeaveClick={onLeaveClick}
      />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Workspace options" }), {
      key: "Enter",
    });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Leave Workspace" }));

    expect(onLeaveClick).toHaveBeenCalledOnce();
  });

  it("explains that the Workspace Owner must transfer ownership before leaving", async () => {
    render(
      <WorkspaceHeader
        workspace={workspace}
        onCreateBoardClick={vi.fn()}
        leaveWorkspaceDisabledReason="Transfer Workspace ownership before leaving."
      />
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Workspace options" }), {
      key: "Enter",
    });
    const leaveItem = await screen.findByRole("menuitem", { name: /Leave Workspace/ });

    expect(leaveItem.hasAttribute("data-disabled")).toBe(true);
    expect(screen.getByText("Transfer Workspace ownership before leaving.")).toBeTruthy();
  });
});
