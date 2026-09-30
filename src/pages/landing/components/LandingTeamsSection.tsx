import * as React from "react";
import {
  Code,
  Compass,
  Network,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MockKanbanBoard } from "./MockKanbanBoard";
import type { LandingTeamRole, TeamBoardData } from "@/types";

const TEAMS_DATA: Record<LandingTeamRole, TeamBoardData> = {
  software: {
    role: "software",
    label: "Software Engineering",
    sprintName: "Core Platform / Sprint 42",
    activeTasks: 14,
    columns: [
      {
        id: "sw-todo",
        title: "To do",
        count: 4,
        indicatorClass: "bg-neutral-400",
        cards: [
          {
            id: "sw-1",
            title: "Configure token refresh endpoint with Zod schema",
            tag: "Backend",
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
            priority: "high",
            dueText: "Oct 12",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
          {
            id: "sw-2",
            title: "Write Vitest suite for session expiration",
            tag: "Testing",
            tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
            priority: "medium",
            dueText: "Oct 13",
            assigneeInitials: "AM",
            assigneeBgClass: "bg-primary-600",
          },
        ],
      },
      {
        id: "sw-progress",
        title: "In progress",
        count: 3,
        indicatorClass: "bg-primary-500",
        cards: [
          {
            id: "sw-3",
            title: "Implement secure OAuth rotation & token storage",
            tag: "Security",
            tagColorClass: "bg-red-100 text-red-800 border-red-300",
            priority: "high",
            dueText: "Today 4:00 PM",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
          {
            id: "sw-4",
            title: "Add WebSocket live cursors to collaborative board",
            tag: "Realtime",
            tagColorClass: "bg-cyan-100 text-cyan-800 border-cyan-300",
            priority: "medium",
            dueText: "Tomorrow",
            assigneeInitials: "DK",
            assigneeBgClass: "bg-[#0284C7]",
          },
        ],
      },
      {
        id: "sw-review",
        title: "Review",
        count: 2,
        indicatorClass: "bg-warning-500",
        cards: [
          {
            id: "sw-5",
            title: "API schema for AI agent pull request review",
            tag: "AI Engine",
            tagColorClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
            priority: "high",
            dueText: "Today",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
        ],
      },
      {
        id: "sw-done",
        title: "Done",
        count: 5,
        indicatorClass: "bg-success-500",
        cards: [
          {
            id: "sw-6",
            title: "Migrate config files to TypeScript & jiti v2",
            tag: "Tooling",
            tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            priority: "low",
            dueText: "Oct 10",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
    ],
  },
  product: {
    role: "product",
    label: "Product Management",
    sprintName: "Growth & Retention / Q4 Roadmap",
    activeTasks: 18,
    columns: [
      {
        id: "pm-todo",
        title: "Backlog",
        count: 6,
        indicatorClass: "bg-neutral-400",
        cards: [
          {
            id: "pm-1",
            title: "User onboarding funnel drop-off analysis",
            tag: "Analytics",
            tagColorClass: "bg-blue-100 text-blue-800 border-blue-300",
            priority: "medium",
            dueText: "Oct 20",
            assigneeInitials: "SJ",
            assigneeBgClass: "bg-[#059669]",
          },
        ],
      },
      {
        id: "pm-progress",
        title: "In Discovery",
        count: 4,
        indicatorClass: "bg-primary-500",
        cards: [
          {
            id: "pm-2",
            title: "Draft PRD for Workspace Multi-Tenant Invitations",
            tag: "PRD",
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
            priority: "high",
            dueText: "Oct 15",
            assigneeInitials: "SJ",
            assigneeBgClass: "bg-[#059669]",
          },
        ],
      },
      {
        id: "pm-review",
        title: "Stakeholder Review",
        count: 3,
        indicatorClass: "bg-warning-500",
        cards: [
          {
            id: "pm-3",
            title: "Pricing tier structure & seat licensing RFC",
            tag: "Strategy",
            tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
            priority: "high",
            dueText: "Tomorrow",
            assigneeInitials: "MV",
            assigneeBgClass: "bg-[#1D4ED8]",
          },
        ],
      },
      {
        id: "pm-done",
        title: "Shipped",
        count: 9,
        indicatorClass: "bg-success-500",
        cards: [
          {
            id: "pm-4",
            title: "Enterprise SSO specification & audit requirements",
            tag: "Security",
            tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            priority: "low",
            dueText: "Oct 08",
            assigneeInitials: "SJ",
            assigneeBgClass: "bg-[#059669]",
          },
        ],
      },
    ],
  },
  architecture: {
    role: "architecture",
    label: "System Architecture",
    sprintName: "Infrastructure & Platform RFCs",
    activeTasks: 8,
    columns: [
      {
        id: "ar-todo",
        title: "Proposed RFCs",
        count: 3,
        indicatorClass: "bg-neutral-400",
        cards: [
          {
            id: "ar-1",
            title: "Database sharding strategy for 10M+ daily events",
            tag: "Database",
            tagColorClass: "bg-blue-100 text-blue-800 border-blue-300",
            priority: "high",
            dueText: "Oct 25",
            assigneeInitials: "MV",
            assigneeBgClass: "bg-[#1D4ED8]",
          },
        ],
      },
      {
        id: "ar-progress",
        title: "Under Benchmark",
        count: 2,
        indicatorClass: "bg-primary-500",
        cards: [
          {
            id: "ar-2",
            title: "Event-driven message bus latency profiling",
            tag: "Platform",
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
            priority: "high",
            dueText: "Today 6:00 PM",
            assigneeInitials: "MV",
            assigneeBgClass: "bg-[#1D4ED8]",
          },
        ],
      },
      {
        id: "ar-review",
        title: "Peer Review",
        count: 2,
        indicatorClass: "bg-warning-500",
        cards: [
          {
            id: "ar-3",
            title: "Redis cluster failover and persistence policies",
            tag: "Caching",
            tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
            priority: "medium",
            dueText: "Oct 16",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
        ],
      },
      {
        id: "ar-done",
        title: "Adopted Specs",
        count: 7,
        indicatorClass: "bg-success-500",
        cards: [
          {
            id: "ar-4",
            title: "Frontend state boundaries & TanStack Query cache spec",
            tag: "Architecture",
            tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            priority: "low",
            dueText: "Oct 05",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
    ],
  },
  design: {
    role: "design",
    label: "UI/UX Design",
    sprintName: "Nexora Design System v2",
    activeTasks: 11,
    columns: [
      {
        id: "ds-todo",
        title: "To Design",
        count: 4,
        indicatorClass: "bg-neutral-400",
        cards: [
          {
            id: "ds-1",
            title: "Mobile responsive navigation drawers & gestures",
            tag: "Mobile",
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
            priority: "medium",
            dueText: "Oct 18",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
      {
        id: "ds-progress",
        title: "In Prototype",
        count: 3,
        indicatorClass: "bg-primary-500",
        cards: [
          {
            id: "ds-2",
            title: "WCAG AA contrast audits across neutral & dark tokens",
            tag: "Design System",
            tagColorClass: "bg-blue-100 text-blue-800 border-blue-300",
            priority: "high",
            dueText: "Today",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
      {
        id: "ds-review",
        title: "Handoff Ready",
        count: 2,
        indicatorClass: "bg-warning-500",
        cards: [
          {
            id: "ds-3",
            title: "Dialog and Confirmation modal primitives specification",
            tag: "Primitives",
            tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
            priority: "medium",
            dueText: "Tomorrow",
            assigneeInitials: "AM",
            assigneeBgClass: "bg-primary-600",
          },
        ],
      },
      {
        id: "ds-done",
        title: "Component Verified",
        count: 8,
        indicatorClass: "bg-success-500",
        cards: [
          {
            id: "ds-4",
            title: "Zero Gradient core design token sheet in Tailwind",
            tag: "Tokens",
            tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            priority: "low",
            dueText: "Oct 04",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
    ],
  },
};

export const LandingTeamsSection: React.FC = () => {
  const [activeRole, setActiveRole] = React.useState<LandingTeamRole>("software");
  const currentTeam = TEAMS_DATA[activeRole];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Role-Based Workspaces
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Every team works better in Nexora.
          </h2>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg leading-relaxed max-w-2xl">
            Customized workflows, board views, and context for every engineering
            and product discipline.
          </p>

          {/* Interactive Role Tabs (Inspired by Jira's Persona Selector) */}
          <div className="mt-8 flex flex-wrap items-center justify-start gap-2 p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200 w-fit select-none">
            <button
              type="button"
              onClick={() => setActiveRole("software")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                activeRole === "software"
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Code className="h-3.5 w-3.5 text-primary-600" />
              <span>Software Engineering</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("product")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                activeRole === "product"
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Compass className="h-3.5 w-3.5 text-[#059669]" />
              <span>Product Management</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("architecture")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                activeRole === "architecture"
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Network className="h-3.5 w-3.5 text-[#D97706]" />
              <span>System Architecture</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole("design")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                activeRole === "design"
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Palette className="h-3.5 w-3.5 text-[#7C3AED]" />
              <span>UI/UX Design</span>
            </button>
          </div>
        </div>

        {/* Dynamic Board Preview based on Selected Team */}
        <div className="mt-12">
          <MockKanbanBoard
            boardTitle={currentTeam.sprintName}
            customColumns={currentTeam.columns}
          />
        </div>
      </div>
    </section>
  );
};
