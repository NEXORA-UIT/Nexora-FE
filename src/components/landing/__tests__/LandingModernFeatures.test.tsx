import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LandingNavbar } from "../LandingNavbar";
import { LandingEcosystem } from "../LandingEcosystem";
import { LandingTeamsSection } from "../LandingTeamsSection";

describe("Landing Modern GSAP UI Features", () => {
  it("renders LandingNavbar with anchor links and branding", () => {
    render(
      <MemoryRouter>
        <LandingNavbar />
      </MemoryRouter>
    );

    expect(screen.getByText("Nexora")).toBeDefined();
    expect(screen.getByText("Capabilities")).toBeDefined();
    expect(screen.getByText("Features")).toBeDefined();
    expect(screen.getByText("Ecosystem")).toBeDefined();
    expect(screen.getByText("Log in")).toBeDefined();
    expect(screen.getByText("Get started")).toBeDefined();
  });

  it("renders LandingEcosystem with 6 toolchain integrations", () => {
    render(
      <MemoryRouter>
        <LandingEcosystem />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Integrates natively with your toolchain")
    ).toBeDefined();
    expect(screen.getByText("GitHub")).toBeDefined();
    expect(screen.getByText("GitLab")).toBeDefined();
    expect(screen.getByText("Figma")).toBeDefined();
    expect(screen.getByText("Slack")).toBeDefined();
    expect(screen.getByText("VS Code")).toBeDefined();
    expect(screen.getByText("Postman")).toBeDefined();
  });

  it("renders LandingTeamsSection with role buttons and indicator pill", () => {
    render(
      <MemoryRouter>
        <LandingTeamsSection />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /software/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /product/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /architecture/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /design/i })).toBeDefined();
  });
});
