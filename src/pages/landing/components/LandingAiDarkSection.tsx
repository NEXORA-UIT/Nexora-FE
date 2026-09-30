import * as React from "react";
import { ShieldCheck, GitBranch, Zap } from "lucide-react";

export const LandingAiDarkSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#0A0F1D] py-20 sm:py-28 text-white select-none">
      {/* Subtle Dot Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(#94A3B8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl text-left mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
            Stop asking generic AI to manage{" "}
            <span className="text-[#38BDF8]">complex engineering sprints.</span>
          </h2>

          <p className="mt-4 text-base text-neutral-400 sm:text-lg leading-relaxed">
            Most AI assistants guess without knowing your team's state. Nexora's AI
            grounds every answer in your actual boards, architecture RFCs, and git activity.
          </p>
        </div>

        {/* 3 High-Tech Cards with Vivid Accents */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Cyan / Grounded */}
          <div className="rounded-2xl border border-neutral-800 bg-[#111827]/90 p-7 shadow-lg backdrop-blur-xs transition-all hover:border-[#38BDF8]/50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/40 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white">
              Zero-Hallucination Grounding
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Every summary and answer explicitly links back to source task IDs,
              sprint milestones, and uploaded PRD paragraphs.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#38BDF8]">
              <span>Sources: Sprint 42 • Task #128</span>
            </div>
          </div>

          {/* Card 2: Violet / Blockers */}
          <div className="rounded-2xl border border-neutral-800 bg-[#111827]/90 p-7 shadow-lg backdrop-blur-xs transition-all hover:border-[#A78BFA]/50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40 shadow-xs">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white">
              Proactive Dependency Detection
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Traces upstream blockers across squads before they derail your
              sprint. Alerts reviewers when schemas are out of sync.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#A78BFA]">
              <span>Auto-alert: 1 dependency blocked</span>
            </div>
          </div>

          {/* Card 3: Emerald / Velocity */}
          <div className="rounded-2xl border border-neutral-800 bg-[#111827]/90 p-7 shadow-lg backdrop-blur-xs transition-all hover:border-[#34D399]/50">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#059669]/20 text-[#34D399] border border-[#059669]/40 shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white">
              Automated Release Synthesis
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Generates accurate sprint retrospective notes, changelogs, and team
              velocity summaries in seconds without manual reporting.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#34D399]">
              <span>Generated in 1.4s • 28 tasks parsed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
