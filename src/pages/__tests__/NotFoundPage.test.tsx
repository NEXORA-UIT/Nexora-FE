import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotFoundPage } from "../NotFoundPage";
import { router } from "@/routes";
import { KnowledgeBasePage } from "@/pages/knowledge/KnowledgeBasePage";
import { HelpPage } from "@/pages/help/HelpPage";
import { UnderDevelopmentPage } from "@/pages/UnderDevelopmentPage";

interface RouteShape {
  path?: string;
  element?: React.ReactElement;
  children?: RouteShape[];
}

function findRoute(path: string, routes: RouteShape[] = router.routes as RouteShape[]): RouteShape | undefined {
  for (const route of routes) {
    if (route.path === path) return route;
    const nested = route.children && findRoute(path, route.children);
    if (nested) return nested;
  }
  return undefined;
}

describe("NotFoundPage", () => {
  it("explains the missing page and provides working home and boards links", () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: /page not found/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /go to home/i }).getAttribute("href")).toBe("/home");
    expect(screen.getByRole("link", { name: /browse boards/i }).getAttribute("href")).toBe("/boards");
  });

  it("routes Knowledge and Help to their pages, keeps AI under development, and catches unknown paths", () => {
    expect(findRoute("/knowledge")?.element?.type).toBe(KnowledgeBasePage);
    expect(findRoute("/help")?.element?.type).toBe(HelpPage);
    expect(findRoute("/assistant")?.element?.type).toBe(UnderDevelopmentPage);
    expect(findRoute("*")?.element?.type).toBe(NotFoundPage);
  });
});
