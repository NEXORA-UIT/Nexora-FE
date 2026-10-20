import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { WorkspaceInvitationPage } from "../WorkspaceInvitationPage";
import { ApiError } from "@/apis/client";

const { acceptWorkspaceInvitation, rejectWorkspaceInvitation } = vi.hoisted(() => ({
  acceptWorkspaceInvitation: vi.fn(),
  rejectWorkspaceInvitation: vi.fn(),
}));

vi.mock("@/apis/workspace.api", () => ({
  workspaceApi: { acceptWorkspaceInvitation, rejectWorkspaceInvitation },
}));

describe("WorkspaceInvitationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts the token invitation and returns to Boards", async () => {
    acceptWorkspaceInvitation.mockResolvedValue({ id: "invitation-1" });
    render(
      <MemoryRouter initialEntries={["/workspace-invitations?token=invite-token"]}>
        <Routes>
          <Route path="/workspace-invitations" element={<WorkspaceInvitationPage />} />
          <Route path="/boards" element={<p>Boards home</p>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /accept invitation/i }));
    await waitFor(() => expect(acceptWorkspaceInvitation).toHaveBeenCalledWith("invite-token"));
    expect(await screen.findByText("Boards home")).toBeDefined();
  });

  it("disables invitation actions when the link has no token", () => {
    render(
      <MemoryRouter initialEntries={["/workspace-invitations"]}>
        <WorkspaceInvitationPage />
      </MemoryRouter>
    );

    expect(screen.getByText("This invitation link is missing its token.")).toBeDefined();
    expect(screen.getByRole("button", { name: /accept invitation/i })).toHaveProperty(
      "disabled",
      true
    );
  });

  it("shows a safe English message when the invitation API returns Vietnamese copy", async () => {
    acceptWorkspaceInvitation.mockRejectedValueOnce(
      new ApiError("Lời mời đã hết hạn", "INVITATION_EXPIRED", 400)
    );
    render(
      <MemoryRouter initialEntries={["/workspace-invitations?token=invite-token"]}>
        <WorkspaceInvitationPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /accept invitation/i }));
    expect(await screen.findByText("We could not process this invitation.")).toBeTruthy();
    expect(screen.queryByText("Lời mời đã hết hạn")).toBeNull();
  });
});
