import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { KnowledgeBasePage } from "../KnowledgeBasePage";

function renderPage() {
  return render(<MemoryRouter><KnowledgeBasePage /></MemoryRouter>);
}

describe("KnowledgeBasePage", () => {
  it("clearly labels the read-only article library as demo content", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /knowledge base/i }).className).toMatch(/text-white/);
    expect(screen.getAllByText(/demo content/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /create article|edit article|delete article/i })).toBeNull();
  });

  it("searches article title, summary, and content without case sensitivity", () => {
    renderPage();
    fireEvent.change(screen.getByRole("searchbox", { name: /search articles/i }), {
      target: { value: "BOARD STATUS" },
    });
    expect(screen.getByText(/how board status works/i)).toBeTruthy();
    expect(screen.queryByText(/workspace membership basics/i)).toBeNull();

    fireEvent.change(screen.getByRole("searchbox", { name: /search articles/i }), {
      target: { value: "dependency" },
    });
    expect(screen.getByText(/how board status works/i)).toBeTruthy();
  });

  it("filters by category and lets the user clear an empty result", () => {
    renderPage();
    fireEvent.change(screen.getByRole("combobox", { name: /filter by category/i }), {
      target: { value: "Planning" },
    });
    expect(screen.getByText(/how board status works/i)).toBeTruthy();
    expect(screen.queryByText(/workspace membership basics/i)).toBeNull();

    fireEvent.change(screen.getByRole("searchbox", { name: /search articles/i }), {
      target: { value: "nothing matches" },
    });
    expect(screen.getByText(/no articles match/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.getByText(/workspace membership basics/i)).toBeTruthy();
  });

  it("opens an article detail and returns to the library", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /workspace membership basics/i }));
    expect(screen.getByRole("heading", { name: /workspace membership basics/i })).toBeTruthy();
    expect(screen.getByText(/demo content/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /back to knowledge base/i }));
    expect(screen.getByRole("searchbox", { name: /search articles/i })).toBeTruthy();
  });
});
