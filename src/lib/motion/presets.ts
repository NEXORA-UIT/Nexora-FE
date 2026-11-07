import { gsap, MOTION_TIMING } from "./gsap";

/**
 * Checks if the user prefers reduced motion.
 * Supports URL override (?motion=force / ?motion=reduce) or localStorage ("nexora_motion").
 * Respects OS setting while allowing developer/user testing override.
 */
export function isReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("motion") === "force" || params.get("motion") === "true") {
      return false;
    }
    if (params.get("motion") === "reduce" || params.get("motion") === "false") {
      return true;
    }
    const local = localStorage.getItem("nexora_motion");
    if (local === "force") return false;
    if (local === "reduce") return true;
  } catch {
    // Ignore storage/search errors in restricted environments
  }

  if (typeof window.matchMedia !== "function") {
    return false;
  }

  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  return Boolean(mql?.matches);
}

export interface FadeInOptions {
  y?: number;
  x?: number;
  duration?: number;
  delay?: number;
  ease?: string;
}

/**
 * Smooth entrance animation for single elements.
 * Automatically bypasses transforms when reduced motion is preferred.
 */
export function fadeInUp(
  target: gsap.DOMTarget,
  options: FadeInOptions = {}
): gsap.core.Tween {
  const {
    y = 16,
    x = 0,
    duration = MOTION_TIMING.durationBase,
    delay = 0,
    ease = MOTION_TIMING.easeEnter,
  } = options;

  if (isReducedMotion()) {
    return gsap.to(target, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0,
    });
  }

  return gsap.fromTo(
    target,
    { opacity: 0, y, x },
    {
      opacity: 1,
      y: 0,
      x: 0,
      duration,
      delay,
      ease,
      clearProps: "transform,opacity",
    }
  );
}

export interface StaggerOptions extends FadeInOptions {
  stagger?: number;
}

/**
 * Staggered cascade entrance for element collections (e.g. Kanban columns, card lists).
 */
export function staggerList(
  targets: gsap.DOMTarget,
  options: StaggerOptions = {}
): gsap.core.Tween {
  const {
    y = 14,
    x = 0,
    duration = MOTION_TIMING.durationBase,
    delay = 0,
    stagger = 0.04,
    ease = MOTION_TIMING.easeEnter,
  } = options;

  if (isReducedMotion()) {
    return gsap.to(targets, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0,
    });
  }

  return gsap.fromTo(
    targets,
    { opacity: 0, y, x },
    {
      opacity: 1,
      y: 0,
      x: 0,
      duration,
      delay,
      stagger,
      ease,
      clearProps: "transform,opacity",
    }
  );
}

export interface CounterOptions {
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  onUpdate?: (formattedValue: string) => void;
}

/**
 * Smoothly rolls up a number from start to end value.
 */
export function counterRoll(
  targetNumber: number,
  options: CounterOptions = {}
): gsap.core.Tween {
  const {
    duration = 1.0,
    delay = 0,
    decimals = 0,
    prefix = "",
    suffix = "",
    onUpdate,
  } = options;

  const proxy = { val: 0 };

  if (isReducedMotion()) {
    if (onUpdate) {
      onUpdate(`${prefix}${targetNumber.toFixed(decimals)}${suffix}`);
    }
    return gsap.to(proxy, { val: targetNumber, duration: 0 });
  }

  return gsap.to(proxy, {
    val: targetNumber,
    duration,
    delay,
    ease: "power2.out",
    onUpdate: () => {
      if (onUpdate) {
        onUpdate(`${prefix}${proxy.val.toFixed(decimals)}${suffix}`);
      }
    },
  });
}
