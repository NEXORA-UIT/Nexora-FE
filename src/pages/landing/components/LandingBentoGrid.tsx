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
            Architected for modern engineering rigor
          </h2>

          <p className="mt-4 text-base text-neutral-600 sm:text-lg leading-relaxed">
            From system architecture RFCs to git pull requests, Nexora tracks the
            code, dependencies, and decisions behind every line you ship.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Bento Card 1 (7 cols): System Dependency Graph */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Live System Dependency Graph
                  </h3>
                </div>
              </div>
            </div>

            {/* Visual Node Diagram */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-900 p-5 text-white select-none">
              <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-800 pb-3">
                <span className="font-mono text-[11px] text-neutral-300">
                  topology-view / cluster-us-east.json
                </span>
                <span className="flex items-center gap-1.5 text-success-400 font-mono text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-success-400 animate-pulse" />
                  Synced with Git main
                </span>
              </div>

              {/* Node Flow Representation */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Node 1 */}
                <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-3 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    API Gateway
                  </span>
                  <p className="mt-1 text-xs font-bold text-white">auth.nexora.dev</p>
                  <div className="mt-2 inline-block rounded bg-primary-500/20 px-2 py-0.5 text-[10px] font-mono text-primary-300">
                    HTTP/2 • 28ms
                  </div>
                </div>

                {/* Node 2 */}
                <div className="rounded-lg border border-primary-500/40 bg-primary-950/40 p-3 text-center ring-1 ring-primary-500/30">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary-300">
                    Task Engine
                  </span>
                  <p className="mt-1 text-xs font-bold text-white">core-tasks-svc</p>
                  <div className="mt-2 inline-block rounded bg-success-500/20 px-2 py-0.5 text-[10px] font-mono text-success-300">
                    Healthy • v2.4.1
                  </div>
                </div>

                {/* Node 3 */}
                <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-3 text-center">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Cache Cluster
                  </span>
                  <p className="mt-1 text-xs font-bold text-white">redis-primary</p>
                  <div className="mt-2 inline-block rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                    99.98% Hit Rate
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-neutral-800/50 px-3.5 py-2 text-[11px] text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary-400" />
                  Dependency analysis validated against RFC-104 schema constraints.
                </span>
                <span className="font-mono text-[10px] text-neutral-400">
                  Audit: PASSED
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 2 (5 cols): Architecture Blueprint Spec */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                <FileCode2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Technical Blueprints
                </h3>
                <p className="text-xs text-neutral-500">
                  Zod schemas & RFCs tied directly to tickets
                </p>
              </div>
            </div>

            {/* Code Block Mockup */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-950 p-4 font-mono text-xs select-none">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-[11px] text-neutral-400">
                <span>TaskContract.ts</span>
                <span className="text-purple-400">TypeScript 5.7</span>
              </div>

              <pre className="mt-3 overflow-x-auto text-[11px] leading-relaxed text-neutral-300">
                <code>
                  <span className="text-purple-400">export const</span>{" "}
                  <span className="text-primary-300">TaskSchema</span> = z.object({"{"}
                  {"\n"}  id: z.string().uuid(),
                  {"\n"}  status: z.enum([
                  {"\n"}    <span className="text-emerald-400">"todo"</span>,{" "}
                  <span className="text-emerald-400">"in_progress"</span>,{" "}
                  <span className="text-emerald-400">"done"</span>
                  {"\n"}  ]),
                  {"\n"}  priority: z.enum([
                  <span className="text-amber-400">"high"</span>,{" "}
                  <span className="text-amber-400">"urgent"</span>]),
                  {"\n"}{"})"};
                </code>
              </pre>
            </div>
          </div>

          {/* Bento Card 3 (5 cols): Git & CI/CD Linkage */}
          <div className="lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <GitPullRequest className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Automated Git Synchronization
                </h3>
              </div>
            </div>

            {/* PR Mock Card */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                    PR #108
                  </span>
                  <span className="text-xs font-bold text-neutral-900 line-clamp-1">
                    feat(auth): token rotation & storage
                  </span>
                </div>
                <Badge variant="success" size="sm">
                  Merged
                </Badge>
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Auto-linked to <span className="font-mono text-primary-700 font-bold">#NEX-128</span>.
                Branch deleted.
              </p>

              <div className="mt-3.5 flex items-center gap-2 rounded-lg bg-white p-2.5 border border-neutral-200 text-xs">
                <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />
                <span className="font-medium text-neutral-700 text-[11px]">
                  All CI checks passed (Vitest, TypeCheck, ESLint, WCAG)
                </span>
              </div>
            </div>
          </div>

          {/* Bento Card 4 (7 cols): Grounded AI Context Stream */}
          <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Grounded AI Sprint Context
                  </h3>
                </div>
              </div>
            </div>

            {/* Chat Simulation Box */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
              {/* User message */}
              <div className="flex items-center justify-end">
                <div className="rounded-xl rounded-tr-xs bg-primary-600 px-3.5 py-2 text-xs font-medium text-white shadow-2xs">
                  "Which tasks are blocking our Sprint 42 release cut?"
                </div>
              </div>

              {/* AI response */}
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 text-xs font-bold">
                  AI
                </div>
                <div className="rounded-xl rounded-tl-xs border border-neutral-200 bg-white p-3 text-xs text-neutral-800 shadow-2xs space-y-1.5">
                  <p className="font-medium">
                    Found <strong>1 active blocker</strong> before release tag can be cut:
                  </p>
                  <ul className="list-disc pl-4 text-neutral-600 text-[11px] space-y-0.5">
                    <li>
                      <span className="font-mono text-primary-700 font-bold">#NEX-132</span>:
                      Redis cluster migration benchmark pending Clara's sign-off.
                    </li>
                  </ul>
                  <div className="pt-1 flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                    <span>Source: Sprint 42 Board • PR #108</span>
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
