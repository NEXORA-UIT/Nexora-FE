import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DialogRoot, DialogContent } from "../dialog";

describe("DialogContent responsive bottom-sheet behavior", () => {
  it("includes mobile bottom-sheet styling rules", () => {
    render(
      <DialogRoot open={true}>
        <DialogContent size="md">
          <div>Dialog Content</div>
        </DialogContent>
      </DialogRoot>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("max-sm:bottom-0");
  });
});
