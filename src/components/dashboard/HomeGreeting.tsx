import * as React from "react";
import { ArrowRight, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth.store";
import type { Workspace } from "@/types";

interface HomeGreetingProps {
  workspace: Workspace;
  boardCount: number;
  openTaskCount: number;
  isTaskLoading: boolean;
  taskError: string | null;
}

export const HomeGreeting: React.FC<HomeGreetingProps> = ({ workspace, boardCount, openTaskCount, isTaskLoading, taskError }) => {
  const user = useAuthStore((state) => state.user);
  const displayName = user?.fullName || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date());

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-[#2563EB] px-6 py-6 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">{today}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{greeting}, {displayName}</h1>
          <p className="mt-2 text-sm text-blue-100">Here’s what needs your attention today.</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-blue-50">
            <span className="inline-flex items-center gap-1.5 font-semibold"><Layers3 aria-hidden="true" className="h-3.5 w-3.5" />{workspace.name}</span>
            <span aria-hidden="true" className="text-blue-300">·</span><span>{boardCount} {boardCount === 1 ? "active board" : "active boards"}</span>
            <span aria-hidden="true" className="text-blue-300">·</span>
            <span>{isTaskLoading ? "Assigned task count loading…" : taskError ? "Assigned task count unavailable" : `${openTaskCount} open assigned ${openTaskCount === 1 ? "task" : "tasks"}`}</span>
          </div>
        </div>
        <Link to={ROUTES.MY_TASKS} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700">
          Review my tasks <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};
