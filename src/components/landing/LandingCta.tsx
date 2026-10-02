import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export const LandingCta: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0A0F1D] px-8 py-16 sm:px-16 sm:py-20 text-center shadow-2xl">
          {/* Subtle Dot Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(#94A3B8 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative mx-auto max-w-3xl">
            {/* Lime Green Accent Badge */}

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Ready to streamline your{" "}
              <span className="text-[#38BDF8]">project workflows</span>?
            </h2>

            <p className="mt-4 text-sm text-neutral-300 sm:text-base leading-relaxed max-w-2xl mx-auto">
              Empower your team to plan projects, coordinate tasks, and track
              progress with clarity and intelligent support.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="h-12 rounded-xl bg-primary-600 px-8 text-sm font-bold text-white shadow-lg hover:bg-primary-500 transition-all cursor-pointer"
                onClick={() => navigate(ROUTES.REGISTER)}
              >
                <span>Get started for free</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 rounded-xl border-neutral-700 bg-neutral-900/80 px-7 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
                onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
              >
                <span>Schedule a live demo</span>
              </Button>
            </div>

            {/* Checklist */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-semibold text-neutral-400 select-none">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#34D399]" />
                <span>Instant 2-minute setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
