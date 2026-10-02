import * as React from "react";
import { Quote } from "lucide-react";

export const LandingStatsAndQuotes: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Jira-Style Solid Color Testimonial Blocks */}
        <div>
          <div className="max-w-3xl text-left mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Built for teams that value structured execution
            </h2>
            <p className="mt-3 text-base text-neutral-600 sm:text-lg leading-relaxed">
              See how teams organize complex projects, track deliverables, and hit milestones with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Card 1: Solid Royal Blue (Inspired by modern Jira marketing) */}
            <div className="relative rounded-3xl bg-[#1D4ED8] p-8 sm:p-10 text-white shadow-xl overflow-hidden flex flex-col justify-between">
              <div>
                <Quote className="h-10 w-10 text-white/50 mb-4" />
                <p className="text-lg sm:text-xl font-medium leading-relaxed text-white">
                  "Nexora transformed how our 40-member cross-functional team operates.
                  It gives us total clarity on task dependencies, milestones, and project
                  documents across every stage of delivery."
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3.5 border-t border-white/20 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 font-bold text-white text-sm">
                  CC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Clara Chen</h4>
                  <p className="text-xs text-blue-100 font-medium">
                    Lead Project Manager • Vanguard Technologies
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Solid Deep Emerald */}
            <div className="relative rounded-3xl bg-[#065F46] p-8 sm:p-10 text-white shadow-xl overflow-hidden flex flex-col justify-between">
              <div>
                <Quote className="h-10 w-10 text-white/50 mb-4" />
                <p className="text-lg sm:text-xl font-medium leading-relaxed text-white">
                  "The interface is remarkably clean and responsive. Our teams actually enjoy
                  keeping their boards and tasks up to date instead of treating status tracking
                  as dreaded administrative overhead."
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3.5 border-t border-white/20 pt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 font-bold text-white text-sm">
                  AM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Alex Morgan</h4>
                  <p className="text-xs text-emerald-100 font-medium">
                    Operations Director • Apex Systems
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
