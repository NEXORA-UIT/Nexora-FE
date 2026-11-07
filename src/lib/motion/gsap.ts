import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Safely register plugins in browser environment when matchMedia is supported
if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Enterprise Motion Pacing & Curves (Subtle & High-Performance)
export const MOTION_TIMING = {
  durationFast: 0.25,
  durationBase: 0.4,
  durationEntrance: 0.5,
  easeEnter: "power3.out",
  easeDecel: "expo.out",
  easeSmooth: "power2.out",
} as const;

export { gsap, ScrollTrigger, useGSAP };
