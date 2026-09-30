import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const HomeGreeting: React.FC = () => {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      {/* Left: User Welcome & Scope Stats */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          Good morning, Đạt 👋
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Here's what needs your attention today.
        </p>

        {/* Metadata Line */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-600">
          <div className="flex items-center gap-1.5 text-primary-600 font-semibold">
            <Layers className="h-3.5 w-3.5" />
            <span>Core Platform</span>
          </div>
          <span className="text-neutral-300">•</span>
          <span>4 Boards</span>
          <span className="text-neutral-300">•</span>
          <span>12 members</span>
          <span className="text-neutral-300">•</span>
          <span className="font-semibold text-neutral-800">28 open tasks</span>
        </div>
      </div>

      {/* Right: Today Banner Card */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200/90 bg-white p-3.5 shadow-xs sm:px-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Today
          </span>
          <p className="text-xs font-semibold text-neutral-800">
            Wednesday, Oct 11
          </p>
        </div>

        <Link
          to={ROUTES.UNDER_DEVELOPMENT}
          className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
        >
          <span>4 tasks due today</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};
