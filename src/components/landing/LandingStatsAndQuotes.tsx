import * as React from "react";
import { Quote } from "lucide-react";
import { useGSAP, gsap, ScrollTrigger, MOTION_TIMING, isReducedMotion, counterRoll } from "@/lib/motion";

export const LandingStatsAndQuotes: React.FC = () => {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [metric1, setMetric1] = React.useState("3x");
  const [metric2, setMetric2] = React.useState("40%");
  const [metric3, setMetric3] = React.useState("99.9%");
  const [metric4, setMetric4] = React.useState("10k+");

  useGSAP(
    () => {
      if (isReducedMotion()) return;

      // 1. Metric Counters Rollup Trigger
      ScrollTrigger.create({
        trigger: ".stats-metrics-grid",
        start: "top 85%",
        once: true,
        onEnter: () => {
          counterRoll(3, {
            duration: 0.8,
            suffix: "x",
            onUpdate: (v) => setMetric1(v),
          });
          counterRoll(40, {
            duration: 1.0,
            suffix: "%",
            onUpdate: (v) => setMetric2(v),
          });
          counterRoll(99.9, {
            duration: 1.2,
            decimals: 1,
            suffix: "%",
            onUpdate: (v) => setMetric3(v),
          });
          counterRoll(10, {
            duration: 0.9,
            suffix: "k+",
            onUpdate: (v) => setMetric4(v),
          });
        },
      });

      // 2. Metrics bar entrance
      gsap.fromTo(
        ".stat-item",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: MOTION_TIMING.easeEnter,
          scrollTrigger: {
            trigger: ".stats-metrics-grid",
            start: "top 85%",
            once: true,
          },
        }
      );

      // 3. Testimonial Cards Entrance
      gsap.fromTo(
        ".testimonial-card",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: MOTION_TIMING.easeEnter,
          scrollTrigger: {
            trigger: ".testimonials-grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 bg-white border-t border-neutral-200 select-none"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Metric Counters Grid */}
        <div className="stats-metrics-grid grid grid-cols-2 gap-6 sm:grid-cols-4 pb-14 border-b border-neutral-200 mb-14">
          <div className="stat-item text-left">
            <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              {metric1}
            </span>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Faster milestone completion
            </p>
          </div>
          <div className="stat-item text-left">
            <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              {metric2}
            </span>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Less time spent in syncs
            </p>
          </div>
          <div className="stat-item text-left">
            <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              {metric3}
            </span>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Real-time collaboration uptime
            </p>
          </div>
          <div className="stat-item text-left">
            <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              {metric4}
            </span>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Active project tasks tracked
            </p>
          </div>
        </div>

        {/* Solid Color Testimonial Blocks */}
        <div>
          <div className="max-w-3xl text-left mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              Built for teams that value structured execution
            </h2>
            <p className="mt-3 text-base text-neutral-600 sm:text-lg leading-relaxed">
              See how teams organize complex projects, track deliverables, and hit milestones with confidence.
            </p>
          </div>

          <div className="testimonials-grid grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Card 1: Solid Royal Blue (Zero-Gradient standard) */}
            <div className="testimonial-card relative rounded-3xl bg-[#1D4ED8] p-8 sm:p-10 text-white shadow-xl overflow-hidden flex flex-col justify-between">
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
            <div className="testimonial-card relative rounded-3xl bg-[#065F46] p-8 sm:p-10 text-white shadow-xl overflow-hidden flex flex-col justify-between">
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
