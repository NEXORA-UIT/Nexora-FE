import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelpPage } from "../HelpPage";

describe("HelpPage", () => {
  it("shows practical guides for the core demo flows with working links", () => {
    render(<MemoryRouter><HelpPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /help & guides/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /workspace access/i }).getAttribute("href")).toBe("/boards");
    expect(screen.getByRole("link", { name: /board planning/i }).getAttribute("href")).toBe("/boards");
    expect(screen.getByRole("link", { name: /my tasks/i }).getAttribute("href")).toBe("/tasks");
    expect(screen.getByRole("link", { name: /workspace calendar/i }).getAttribute("href")).toBe("/calendar");
    expect(screen.getByText(/membership/i)).toBeTruthy();
  });

  it("opens FAQ answers with keyboard-operable buttons", () => {
    render(<MemoryRouter><HelpPage /></MemoryRouter>);
    const question = screen.getByRole("button", { name: /who can manage workspace members/i });

    expect(question.getAttribute("aria-expanded")).toBe("false");
    expect(question.className).toMatch(/focus-visible:ring-2/);
    question.focus();
    expect(document.activeElement).toBe(question);
    fireEvent.click(question);
    expect(question.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/workspace owner/i)).toBeTruthy();
  });
});
