import * as React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon, GitHubIcon } from "@/components/common/Icons";
import { MockKanbanBoard } from "./MockKanbanBoard";
import { ROUTES } from "@/constants/routes";

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");

  const handleQuickSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.REGISTER);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Split Header: Headline & Quick Sign-up Card */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 mb-12 lg:mb-16">
          {/* Left Column (7 cols): Bold Headline */}
          <div className="lg:col-span-7">

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl leading-[1.12]">
              Turn plans into{" "}
              <span className="text-primary-600 underline decoration-primary-200 decoration-wavy underline-offset-8">
                agent-ready tasks.
              </span>
            </h1>

            <p className="mt-5 text-base text-neutral-600 sm:text-lg leading-relaxed max-w-2xl">
              Plan visual boards, ground architecture specs, and collaborate with
              contextual AI across your entire engineering lifecycle.
            </p>
          </div>

          {/* Right Column (5 cols): Quick Interactive Sign-up Card (inspired by Jira) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl sm:p-7">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Get started today
              </span>
              <h2 className="mt-1 text-lg font-bold text-neutral-900">
                Create your team workspace
              </h2>

              <form onSubmit={handleQuickSignUp} className="mt-4 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email..."
                  required
                  className="h-10 w-full rounded-lg border border-neutral-300 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  className="h-10 rounded-lg bg-primary-600 text-xs font-semibold text-white shadow-xs hover:bg-primary-700"
                >
                  <span>Sign up for free</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>

              {/* OAuth Fast Sign-in */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <span className="relative bg-white px-2.5 text-[11px] text-neutral-400 select-none">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                  onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
                >
                  <GoogleIcon className="mr-1.5 h-3.5 w-3.5" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs"
                  onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
                >
                  <GitHubIcon className="mr-1.5 h-3.5 w-3.5" />
                  GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            Multi-color Framed Mockup Showcase (NO logo bar below hero)
            ------------------------------------------------------------- */}
        <MockKanbanBoard />
      </div>
    </section>
  );
};
