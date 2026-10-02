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
            Intelligent assistance built for{" "}
            <span className="text-[#38BDF8]">real project workflows</span>
          </h2>

          <p className="mt-4 text-base text-neutral-400 sm:text-lg leading-relaxed">
            Nexora connects your project boards, milestone deadlines, and team documents to provide practical answers, blocker alerts, and summaries based on your actual work.
          </p>
        </div>

        {/* 3 High-Tech Cards with Vivid Accents */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Cyan / Grounded */}
          <div className="group rounded-2xl border border-neutral-800 bg-[#111827]/90 p-7 shadow-lg backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#38BDF8]/60 hover:shadow-[0_12px_28px_-8px_rgba(56,189,248,0.2)] cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/40 shadow-xs transition-transform duration-200 group-hover:scale-110">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white group-hover:text-[#38BDF8] transition-colors">
              Context-Aware Project Assistant
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Summaries and recommendations link directly to your board tasks,
              milestone schedules, and uploaded project documents.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#38BDF8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
              <span>Sources: Website Redesign • Task #104</span>
            </div>
          </div>

          {/* Card 2: Violet / Blockers */}
          <div className="group rounded-2xl border border-neutral-800 bg-[#111827]/90 p-7 shadow-lg backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#A78BFA]/60 hover:shadow-[0_12px_28px_-8px_rgba(167,139,250,0.2)] cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40 shadow-xs transition-transform duration-200 group-hover:scale-110">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white group-hover:text-[#A78BFA] transition-colors">
              Proactive Blocker Detection
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Identifies overdue dependencies across teams before timelines slip,
              alerting assignees to unblock critical deliverables.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#A78BFA]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
              <span>Alert: 1 dependency pending review</span>
            </div>
          </div>

          {/* Card 3: Emerald / Velocity */}
          <div className="group rounded-2xl border border-neutral-800 bg-[#111827]/90 p-7 shadow-lg backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#34D399]/60 hover:shadow-[0_12px_28px_-8px_rgba(52,211,153,0.2)] cursor-default">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#059669]/20 text-[#34D399] border border-[#059669]/40 shadow-xs transition-transform duration-200 group-hover:scale-110">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white group-hover:text-[#34D399] transition-colors">
              Automated Milestone Summaries
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              Generates concise project status updates, meeting digests, and
              progress reports in seconds without manual compiling.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#34D399]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
              <span>Summary ready • 18 tasks updated</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
