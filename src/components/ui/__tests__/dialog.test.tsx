import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DialogBody,
  DialogRoot,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

describe("shared dialog", () => {
  it("exposes the dialog title and bounded content to assistive technology", () => {
    render(
      <DialogRoot defaultOpen>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Board members</DialogTitle>
            <DialogDescription>Manage access to this Board.</DialogDescription>
          </DialogHeader>
          <DialogBody>Member list</DialogBody>
        </DialogContent>
      </DialogRoot>
    );

    const dialog = screen.getByRole("dialog", { name: "Board members" });

    expect(dialog.getAttribute("data-size")).toBe("lg");
    expect(dialog.textContent).toContain("Manage access to this Board.");
  });

  it("closes with Escape and returns focus to the opener", async () => {
    render(
      <DialogRoot>
        <DialogTrigger>Open settings</DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Board settings</DialogTitle>
          </DialogHeader>
          <DialogBody>Settings form</DialogBody>
        </DialogContent>
      </DialogRoot>
    );

    const opener = screen.getByRole("button", { name: "Open settings" });
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Board settings" });
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Board settings" })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });
});
