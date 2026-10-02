import * as React from "react";
import {
  Network,
  FileCode2,
  GitPullRequest,
  CheckCircle2,
  Sparkles,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const LandingBentoGrid: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-neutral-50/60 border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl text-left mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Built for project clarity, structure, and execution
          </h2>

          <p className="mt-4 text-base text-neutral-600 sm:text-lg leading-relaxed">
            From high-level roadmap planning to task-level dependencies, Nexora connects your workflows, documents, and team decisions in one unified view.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Bento Card 1 (7 cols): Visual Workflow & Dependency Tracking */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Visual Workflow & Dependency Tracking
                  </h3>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-success-50 border border-success-200 px-2.5 py-0.5 text-[11px] font-semibold text-success-700">
                <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
                0 Active Blockers
              </span>
            </div>

            {/* Visual Node Diagram */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-900 p-5 text-white select-none">
              <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-3">
                <span className="font-mono text-[11px] text-neutral-300">
                  workflow-pipeline / Q4-launch.json
                </span>
                <span className="flex items-center gap-1.5 text-success-400 font-mono text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-success-400 animate-pulse" />
                  Synced with workspace
                </span>
              </div>

              {/* Node Flow Representation with Live Data Packets */}
              <div className="mt-5 grid grid-cols-1 items-center gap-3 sm:grid-cols-11">
                {/* Node 1 */}
                <div className="sm:col-span-3 rounded-lg border border-neutral-700 bg-neutral-800/80 p-3 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Phase 1
                  </span>
                  <p className="mt-1 text-xs font-bold text-white">Scope & Brief</p>
                  <div className="mt-2 inline-block rounded bg-success-500/20 px-2 py-0.5 text-[10px] font-mono text-success-300">
                    Completed
                  </div>
                </div>

                {/* Animated Data Conduit 1 -> 2 */}
                <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                  <div className="relative h-0.5 w-full bg-neutral-700 overflow-hidden rounded-full">
                    <div className="absolute top-0 bottom-0 w-3 bg-[#38BDF8] animate-pulse-flow shadow-[0_0_8px_#38BDF8]" />
                  </div>
                </div>

                {/* Node 2 */}
                <div className="sm:col-span-3 rounded-lg border border-primary-500/40 bg-primary-950/40 p-3 text-center ring-1 ring-primary-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary-300">
                    Phase 2
                  </span>
                  <p className="mt-1 text-xs font-bold text-white">Execution</p>
                  <div className="mt-2 inline-block rounded bg-primary-500/20 px-2 py-0.5 text-[10px] font-mono text-primary-300">
                    In Progress
                  </div>
                </div>

                {/* Animated Data Conduit 2 -> 3 */}
                <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                  <div className="relative h-0.5 w-full bg-neutral-700 overflow-hidden rounded-full">
                    <div className="absolute top-0 bottom-0 w-3 bg-[#34D399] animate-pulse-flow shadow-[0_0_8px_#34D399]" />
                  </div>
                </div>

                {/* Node 3 */}
                <div className="sm:col-span-3 rounded-lg border border-neutral-700 bg-neutral-800/80 p-3 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Phase 3
                  </span>
                  <p className="mt-1 text-xs font-bold text-white">Review & QA</p>
                  <div className="mt-2 inline-block rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                    Upcoming
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-800/50 px-3.5 py-2 text-[11px] text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary-400" />
                  Milestone dependencies verified across project deliverables.
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Status: ON TRACK
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 2 (5 cols): Integrated Project Docs & Specs */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <FileCode2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Integrated Docs & Specs
                </h3>
                <p className="text-xs text-neutral-500">
                  Project briefs and guidelines linked directly to tasks
                </p>
              </div>
            </div>

            {/* Structured Spec Mockup */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-950 p-4 font-mono text-xs select-none">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] text-neutral-400">
                <span>ProjectPlan.json</span>
                <span className="text-purple-400">Milestone 4</span>
              </div>

              <pre className="mt-3 overflow-x-auto text-[11px] leading-relaxed text-neutral-300">
                <code>
                  {"{\n"}
                  {"  "}<span className="text-purple-400">"project"</span>: <span className="text-emerald-400">"Website Redesign"</span>,
                  {"\n  "}<span className="text-purple-400">"status"</span>: <span className="text-primary-300">"in_progress"</span>,
                  {"\n  "}<span className="text-purple-400">"deliverables"</span>: [
                  {"\n    "}<span className="text-emerald-400">"Design Guidelines"</span>,
                  {"\n    "}<span className="text-emerald-400">"Task Checklists"</span>,
                  {"\n    "}<span className="text-emerald-400">"QA Review Sign-off"</span>
                  {"\n  ],"}
                  {"\n  "}<span className="text-purple-400">"priority"</span>: <span className="text-amber-400">"high"</span>
                  {"\n}"}
                </code>
              </pre>
            </div>
          </div>

          {/* Bento Card 3 (5 cols): Connected Team Activity */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <GitPullRequest className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Connected Team Activity
                </h3>
                <p className="text-xs text-neutral-500">
                  Real-time updates synced across boards and tools
                </p>
              </div>
            </div>

            {/* Activity Card */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                    Update #108
                  </span>
                  <span className="text-xs font-bold text-neutral-900 line-clamp-1">
                    Design assets & specs finalized
                  </span>
                </div>
                <Badge variant="success" size="sm">
                  Approved
                </Badge>
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Auto-linked to <span className="font-mono text-primary-700 font-bold">#NEX-128</span>.
              </p>

              <div className="mt-3.5 flex items-center gap-2 rounded-lg bg-white p-2.5 border border-neutral-200 text-xs">
                <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />
                <span className="font-medium text-neutral-700 text-[11px]">
                  All checklist items verified (Scope, Review, Sign-off)
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 4 (7 cols): Context-Aware Task Assistant */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Context-Aware Task Assistant
                  </h3>
                </div>
              </div>
            </div>

            {/* Chat Simulation Box */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
              {/* User message */}
              <div className="flex items-center justify-end">
                <div className="rounded-xl rounded-tr-xs bg-primary-600 px-3.5 py-2 text-xs font-medium text-white shadow-2xs">
                  "Which tasks are blocking our milestone delivery?"
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 text-xs font-bold ring-2 ring-primary-300/50 animate-pulse">
                  AI
                </div>
                <div className="rounded-xl rounded-tl-xs border border-neutral-200 bg-white p-3 text-xs text-neutral-800 shadow-2xs space-y-1.5">
                  <p className="font-medium">
                    Found <strong>1 active blocker</strong> before milestone sign-off:
                  </p>
                  <ul className="list-disc pl-4 text-neutral-600 text-[11px] space-y-0.5">
                    <li>
                      <span className="font-mono text-primary-700 font-bold">#NEX-132</span>:
                      Design system review pending Clara's sign-off.
                    </li>
                  </ul>
                  <div className="pt-1 flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                    <span>Source: Website Redesign Board • Milestone Brief</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
