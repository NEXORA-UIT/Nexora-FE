import * as React from "react";
import { Link } from "react-router-dom";
import { Kanban, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const LandingSummaryCards: React.FC = () => {
  return (
    <section className="border-t border-neutral-200 bg-neutral-50/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            The Nexora Difference
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            One workspace. One project context. One intelligent assistant.
          </h2>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base leading-relaxed">
            Eliminate context switching between task trackers, scattered wikis,
            and ungrounded generic AI tools.
          </p>
        </div>

        {/* 3 Summary Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary-600 shadow-2xs">
              <Kanban className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900">
              Contextual Tasks
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              Work with rich metadata, dependencies, and clear ownership on every
              board, list, and swimlane.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#7C3AED] shadow-2xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900">
              Project Knowledge
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              Centralize technical specs, PRDs, RFCs, and guidelines in one
              searchable repository tied to actual work.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#4F46E5] shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-900">
              Unified AI Assistant
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              Chat with an assistant grounded in your team's code, task history,
              and documentation without hallucinations.
            </p>
          </div>
        </div>

        {/* Bottom Explorer Link */}
        <div className="mt-8 text-center">
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            <span>See how modern engineering teams use Nexora</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
