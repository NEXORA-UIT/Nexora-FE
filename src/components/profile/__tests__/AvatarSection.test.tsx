import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarSection } from "../AvatarSection";

describe("AvatarSection dialog", () => {
  it("closes the image URL dialog with Escape", async () => {
    render(<AvatarSection currentAvatarUrl={null} onAvatarChange={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "Change photo" }));
    const dialog = screen.getByRole("dialog", { name: "Change Profile Photo" });
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Change Profile Photo" })).toBeNull();
    });
  });
});
