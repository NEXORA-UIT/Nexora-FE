import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../client";
import { githubApi } from "../github.api";
import { mockGitActivity } from "@/mocks/data/github.mock";
import { ApiError } from "../client";

describe("githubApi", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("uses the documented Board configuration endpoint", async () => {
    const config = {
      boardId: "board-1",
      repositoryName: "nexora/app",
      webhookUrl: "https://api.nexora.local/api/v1/github/webhooks",
      isActive: true,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    };
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: { success: true, data: config } });

    await expect(githubApi.getGitHubConfig("board-1")).resolves.toEqual(config);
    expect(apiClient.get).toHaveBeenCalledWith("/boards/board-1/github/config");
  });

  it("posts configuration with the OpenAPI request shape", async () => {
    const request = { repositoryName: "nexora/app", webhookSecret: "secret" };
    const config = {
      boardId: "board-1",
      ...request,
      webhookUrl: "https://example.com/hook",
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };
    vi.spyOn(apiClient, "post").mockResolvedValueOnce({ data: { success: true, data: config } });

    await expect(githubApi.configureGitHub("board-1", request)).resolves.toEqual(config);
    expect(apiClient.post).toHaveBeenCalledWith("/boards/board-1/github/config", request);
  });

  it("falls back to explicitly marked demo activity while the backend route is unavailable", async () => {
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(new ApiError("Not found", "NOT_FOUND", 404));

    const result = await githubApi.getCardGitActivity("card-1", "NEX-101");
    expect(result.source).toBe("DEMO");
    expect(result.items).toHaveLength(2);
    expect(result.items.every((item) => item.cardId === "card-1" && !("cardCode" in item))).toBe(
      true
    );
    expect(result.items.map((item) => item.id)).toEqual(
      mockGitActivity.filter((item) => item.cardCode === "NEX-101").map((item) => item.id)
    );
  });

  it("does not mask authorization failures with demo activity", async () => {
    const unauthorized = new ApiError("Unauthorized", "UNAUTHORIZED", 401);
    vi.spyOn(apiClient, "get").mockRejectedValueOnce(unauthorized);
    await expect(githubApi.getCardGitActivity("card-1", "NEX-101")).rejects.toBe(unauthorized);
  });
});
