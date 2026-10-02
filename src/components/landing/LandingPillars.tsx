import * as React from "react";
import {
  Kanban,
  BookOpen,
  Sparkles,
  Users,
} from "lucide-react";
import type { LandingPillarItem } from "@/types";

const PILLARS: LandingPillarItem[] = [
  {
    id: "pillar-boards",
    icon: Kanban,
    title: "Visual Task Boards",
    description:
      "Kanban, list & timeline views to structure any workflow with flexible swimlanes and custom fields.",
  },
  {
    id: "pillar-docs",
    icon: BookOpen,
    title: "Project Docs & Wiki",
    description:
      "Structured documentation living right beside your project tasks, specs, and architecture decisions.",
  },
  {
    id: "pillar-ai",
    icon: Sparkles,
    title: "Contextual AI Assistant",
    description:
      "Instant answers, dependency tracking, and blocker detection powered by your actual project data.",
  },
  {
    id: "pillar-team",
    icon: Users,
    title: "Team Alignment",
    description:
      "Real-time activity feeds, ownership tracking, and deadline alerts across all contributors.",
  },
];

export const LandingPillars: React.FC = () => {
  return (
    <section id="capabilities" className="border-t border-neutral-200 bg-neutral-50/60 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Core Capabilities
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Everything your project needs, in one workspace.
          </h2>
          <p className="mt-3 text-sm text-neutral-600 sm:text-base leading-relaxed">
            Four powerful pillars to take your projects from idea to delivery
            without switching tools.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="flex flex-col rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-2xs">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-neutral-900">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
