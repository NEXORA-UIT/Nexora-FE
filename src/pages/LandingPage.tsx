import * as React from "react";
import {
  LandingNavbar,
  LandingHero,
  LandingAiDarkSection,
  LandingTeamsSection,
  LandingBentoGrid,
  LandingStatsAndQuotes,
  LandingEcosystem,
  LandingCta,
  LandingFooter,
} from "@/components/landing";

const MotionNotice: React.FC = () => {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const isRed = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isOverridden = localStorage.getItem("nexora_motion") === "force";
      setReduced(isRed && !isOverridden);
    }
  }, []);

  if (!reduced) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-neutral-300 bg-white/95 px-4 py-2 text-xs text-neutral-700 shadow-xl backdrop-blur-sm select-none">
      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      <span>Windows animation effects are off on your device.</span>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem("nexora_motion", "force");
          window.location.reload();
        }}
        className="font-bold text-primary-600 underline hover:text-primary-700 cursor-pointer ml-1"
      >
        Enable GSAP effects
      </button>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-primary-100 selection:text-primary-900">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section with Split Headline & Quick Sign-up + Kanban Showcase */}
        <LandingHero />

        {/* 3. High-Contrast Dark Charcoal Section: Grounded AI Capabilities */}
        <LandingAiDarkSection />

        {/* 4. Persona Switcher: Software, Product, Architecture, Design */}
        <LandingTeamsSection />

        {/* 5. Architectural Bento Grid: Dependency Graph, Blueprints, Git Sync, AI Context */}
        <LandingBentoGrid />

        {/* 6. Key Metrics & Bold Solid Color Testimonials */}
        <LandingStatsAndQuotes />

        {/* 7. Developer Toolchain & Ecosystem Integrations */}
        <LandingEcosystem />

        {/* 8. Call to Action Banner */}
        <LandingCta />
      </main>

      {/* 9. Footer */}
      <LandingFooter />

      {/* Helper badge when Windows reduced motion is detected */}
      <MotionNotice />
    </div>
  );
};
