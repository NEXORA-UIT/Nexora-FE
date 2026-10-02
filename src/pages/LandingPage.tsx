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

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-primary-100 selection:text-primary-900">
      {/* 1. Sticky Navigation Bar */}
      <LandingNavbar />

      <main>
        {/* 2. Hero Section with Split Headline & Quick Sign-up + Kanban Showcase (No logo bar below) */}
        <LandingHero />

        {/* 3. High-Contrast Dark Charcoal Section: Grounded AI Capabilities */}
        <LandingAiDarkSection />

        {/* 4. Persona Switcher: Software, Product, Architecture, Design */}
        <LandingTeamsSection />

        {/* 5. Architectural Bento Grid: Dependency Graph, Blueprints, Git Sync, AI Context */}
        <LandingBentoGrid />

        {/* 6. Key Metrics & Bold Solid Color Testimonials (Royal Blue & Emerald) */}
        <LandingStatsAndQuotes />

        {/* 7. Developer Toolchain & Ecosystem Integrations */}
        <LandingEcosystem />

        {/* 8. Call to Action Banner */}
        <LandingCta />
      </main>

      {/* 9. Footer */}
      <LandingFooter />
    </div>
  );
};
