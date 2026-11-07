import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function createMatchMediaMock(matches = false) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Initial setup before imports
if (typeof window !== "undefined") {
  window.matchMedia = createMatchMediaMock(false);
}

import {
  isReducedMotion,
  fadeInUp,
  staggerList,
  counterRoll,
  MOTION_TIMING,
} from "../index";

describe("Motion Infrastructure & Presets", () => {
  beforeEach(() => {
    window.matchMedia = createMatchMediaMock(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isReducedMotion", () => {
    it("returns false when prefers-reduced-motion is not set", () => {
      window.matchMedia = createMatchMediaMock(false);
      expect(isReducedMotion()).toBe(false);
    });

    it("returns true when prefers-reduced-motion is reduce", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(isReducedMotion()).toBe(true);
    });

    it("returns false if matchMedia is not a function", () => {
      // @ts-expect-error test undefined case
      window.matchMedia = undefined;
      expect(isReducedMotion()).toBe(false);
    });
  });

  describe("MOTION_TIMING constants", () => {
    it("provides enterprise timing and easing constants", () => {
      expect(MOTION_TIMING.durationFast).toBe(0.25);
      expect(MOTION_TIMING.durationBase).toBe(0.4);
      expect(MOTION_TIMING.easeEnter).toBe("power3.out");
    });
  });

  describe("fadeInUp", () => {
    it("creates a GSAP tween for a DOM element", () => {
      const el = document.createElement("div");
      document.body.appendChild(el);

      const tween = fadeInUp(el, { y: 20, duration: 0.3 });
      expect(tween).toBeDefined();
      expect(typeof tween.kill).toBe("function");

      tween.kill();
      document.body.removeChild(el);
    });

    it("handles reduced motion by setting duration to 0", () => {
      window.matchMedia = createMatchMediaMock(true);
      const el = document.createElement("div");
      document.body.appendChild(el);

      const tween = fadeInUp(el, { y: 20 });
      expect(tween.duration()).toBe(0);

      tween.kill();
      document.body.removeChild(el);
    });
  });

  describe("staggerList", () => {
    it("creates a tween for multiple DOM elements", () => {
      const parent = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.body.appendChild(parent);

      const tween = staggerList([child1, child2], { stagger: 0.05 });
      expect(tween).toBeDefined();

      tween.kill();
      document.body.removeChild(parent);
    });
  });

  describe("counterRoll", () => {
    it("calls onUpdate with formatted value in reduced motion", () => {
      window.matchMedia = createMatchMediaMock(true);
      const onUpdate = vi.fn();

      counterRoll(99.9, { decimals: 1, suffix: "%", onUpdate });

      expect(onUpdate).toHaveBeenCalledWith("99.9%");
    });
  });
});
