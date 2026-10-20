import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { githubApi } from "@/apis/github.api";
import { GitHubConfigModal } from "../GitHubConfigModal";
import type { BoardDetail } from "@/types";

vi.mock("@/apis/github.api", () => ({
  githubApi: {
    getGitHubConfig: vi.fn(),
    configureGitHub: vi.fn(),
    disconnectGitHub: vi.fn(),
  },
  GITHUB_WEBHOOK_URL: "http://localhost:3000/api/v1/github/webhooks",
}));

const board = { id: "board-1", workspaceId: "workspace-1", name: "Roadmap" } as BoardDetail;

describe("GitHubConfigModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(githubApi.getGitHubConfig).mockRejectedValue(new Error("GitHub route unavailable"));
  });

  it("clearly reports that configuration cannot be saved until the backend route exists", async () => {
    render(<GitHubConfigModal board={board} isOpen onClose={vi.fn()} />);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "GitHub configuration is not available"
    );
    expect(screen.getByLabelText("Repository (owner/repo)")).toBeDefined();
  });

  it("submits the documented request when the backend configuration route succeeds", async () => {
    vi.mocked(githubApi.configureGitHub).mockResolvedValue({
      boardId: "board-1",
      repositoryName: "nexora/app",
      webhookUrl: "https://example.com/hook",
      isActive: true,
      createdAt: "",
      updatedAt: "",
    });
    render(<GitHubConfigModal board={board} isOpen onClose={vi.fn()} />);
    fireEvent.change(await screen.findByLabelText("Repository (owner/repo)"), {
      target: { value: "nexora/app" },
    });
    fireEvent.change(screen.getByLabelText("Webhook Secret"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));

    await waitFor(() =>
      expect(githubApi.configureGitHub).toHaveBeenCalledWith("board-1", {
        repositoryName: "nexora/app",
        webhookSecret: "secret",
      })
    );
  });
});
