import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/apis/client";
import { profileApi } from "@/apis/profile.api";
import { ProfileInformationCard } from "@/components/profile/ProfileInformationCard";
import type { UserProfile } from "@/types";

describe("ProfileInformationCard", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("keeps the member's name and presents update errors in English", async () => {
    const user: UserProfile = {
      id: "user-1",
      email: "dat@example.com",
      fullName: "Đạt Nguyễn",
      avatarUrl: null,
      status: "ACTIVE",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    };
    vi.spyOn(profileApi, "updateProfile").mockRejectedValueOnce(
      new ApiError("Không thể cập nhật thông tin", "PROFILE_UPDATE_FAILED", 400)
    );

    render(<ProfileInformationCard user={user} />);
    const nameInput = screen.getByPlaceholderText("e.g. Đạt Phan");
    expect((nameInput as HTMLInputElement).value).toBe("Đạt Nguyễn");
    fireEvent.change(nameInput, { target: { value: "Dat Nguyen" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to update profile information.")).toBeTruthy();
    });
    expect(screen.queryByText("Không thể cập nhật thông tin")).toBeNull();
  });
});
