import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { LandingHero } from "../LandingHero";
import { LandingCta } from "../LandingCta";
import { LandingFooter } from "../LandingFooter";

function CurrentPath() {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
}

describe("landing navigation", () => {
  it("sends OAuth starters to the functional registration screen", () => {
    render(<MemoryRouter initialEntries={["/"]}><CurrentPath /><LandingHero /></MemoryRouter>);
    expect(document.body.textContent).not.toMatch(/intelligent assistance/i);
    fireEvent.click(screen.getByRole("button", { name: "Google" }));
    expect(screen.getByTestId("current-path").textContent).toBe("/register");
  });

  it("sends the secondary landing CTA to login and footer links to implemented pages", () => {
    render(<MemoryRouter initialEntries={["/"]}><CurrentPath /><LandingCta /><LandingFooter /></MemoryRouter>);
    expect(document.body.textContent).not.toMatch(/intelligent support/i);

    fireEvent.click(screen.getByRole("button", { name: /sign in to your workspace/i }));
    expect(screen.getByTestId("current-path").textContent).toBe("/login");
    expect(screen.getByRole("link", { name: "Knowledge Base" }).getAttribute("href")).toBe("/knowledge");
    expect(screen.getByRole("link", { name: "Help & Guides" }).getAttribute("href")).toBe("/help");
    expect(screen.getByRole("link", { name: /AI Assistant.*not implemented/i }).getAttribute("href")).toBe("/assistant");
    expect(document.querySelector('a[href="/under-development"]')).toBeNull();
    expect(document.querySelector('a[href="#pricing"]')).toBeNull();
  });
});
