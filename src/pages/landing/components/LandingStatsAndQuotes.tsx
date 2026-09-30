import * as React from "react";
import { Quote, Sparkles, TrendingUp, CheckCircle, Clock } from "lucide-react";

export const LandingStatsAndQuotes: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top: 4 Key Metrics Bar */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 pb-16 border-b border-neutral-200 text-center select-none">
          <div className="p-4">
            <div className="flex items-center justify-center gap-1.5 text-primary-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Velocity</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              4.2x
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Faster sprint planning & estimation
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-center gap-1.5 text-success-600 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Reliability</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              99.98%
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              SLA uptime across distributed squads
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-center gap-1.5 text-indigo-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Throughput</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              10,000+
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Active engineering tasks orchestrated
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-center gap-1.5 text-[#059669] mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Precision</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              0%
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Hallucinated specs with grounded AI
            </p>
          </div>
        </div>

        {/* Bottom: Jira-Style Solid Color Testimonial Blocks */}
        <div className="mt-16">
          <div className="max-w-3xl text-left mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Engineered for teams that take code seriously
            </h2>
            <p className="mt-3 text-base text-neutral-600 sm:text-lg leading-relaxed">
              Read how leading engineering organizations scale velocity without sacrificing code quality.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Card 1: Solid Royal Blue (Inspired by modern Jira marketing) */}
            <div className="relative rounded-3xl bg-[#1D4ED8] p-8 sm:p-10 text-white shadow-xl overflow-hidden flex flex-col justify-between">
              <div>
                <Quote className="h-10 w-10 text-white/50 mb-4" />
                <p className="text-lg sm:text-xl font-medium leading-relaxed text-white">
                  "Nexora changed how our 40-engineer platform team operates. The AI
                  doesn't give you generic advice — it cites the actual task IDs, PRs,
                  and database constraints we deal with every single sprint."
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3.5 border-t border-white/20 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 font-bold text-white text-sm">
                  CC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Clara Chen</h4>
                  <p className="text-xs text-blue-100 font-medium">
                    Staff Infrastructure Engineer • Vanguard Cloud Technologies
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Solid Deep Emerald */}
            <div className="relative rounded-3xl bg-[#065F46] p-8 sm:p-10 text-white shadow-xl overflow-hidden flex flex-col justify-between">
              <div>
                <Quote className="h-10 w-10 text-white/50 mb-4" />
                <p className="text-lg sm:text-xl font-medium leading-relaxed text-white">
                  "The zero-gradient interface is breathtakingly crisp and blazing
                  fast. Our engineers actually enjoy updating their boards instead of
                  treating standup updates as a dreaded administrative chore."
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3.5 border-t border-white/20 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 font-bold text-white text-sm">
                  AM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Alex Morgan</h4>
                  <p className="text-xs text-emerald-100 font-medium">
                    VP of Engineering • Apex Financial Systems
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
