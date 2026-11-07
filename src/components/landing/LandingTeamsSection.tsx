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
import { useGSAP, gsap, MOTION_TIMING, isReducedMotion } from "@/lib/motion";

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
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
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
    sprintName: "Q4 Roadmap & Milestone Tracking",
    activeTasks: 18,
    columns: [
      {
        id: "pm-todo",
        title: "To do",
        count: 3,
        indicatorClass: "bg-neutral-400",
        cards: [
          {
            id: "pm-1",
            title: "Draft PRD for autonomous AI agent workflows",
            tag: "Strategy",
            tagColorClass: "bg-blue-100 text-blue-800 border-blue-300",
            priority: "high",
            dueText: "Oct 15",
            assigneeInitials: "AM",
            assigneeBgClass: "bg-primary-600",
          },
          {
            id: "pm-2",
            title: "Competitor pricing analysis & packaging tier",
            tag: "Growth",
            tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            priority: "medium",
            dueText: "Oct 18",
            assigneeInitials: "DK",
            assigneeBgClass: "bg-[#0284C7]",
          },
        ],
      },
      {
        id: "pm-progress",
        title: "In progress",
        count: 4,
        indicatorClass: "bg-primary-500",
        cards: [
          {
            id: "pm-3",
            title: "Customer discovery interviews (Enterprise batch #4)",
            tag: "Research",
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
            priority: "high",
            dueText: "Today",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
          {
            id: "pm-4",
            title: "Define release criteria & dogfooding schedule",
            tag: "Operations",
            tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
            priority: "medium",
            dueText: "Oct 14",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
      {
        id: "pm-review",
        title: "Review",
        count: 2,
        indicatorClass: "bg-warning-500",
        cards: [
          {
            id: "pm-5",
            title: "Quarterly OKR alignment deck for leadership",
            tag: "Executive",
            tagColorClass: "bg-red-100 text-red-800 border-red-300",
            priority: "high",
            dueText: "Today 3:00 PM",
            assigneeInitials: "AM",
            assigneeBgClass: "bg-primary-600",
          },
        ],
      },
      {
        id: "pm-done",
        title: "Done",
        count: 6,
        indicatorClass: "bg-success-500",
        cards: [
          {
            id: "pm-6",
            title: "Synthesize NPS feedback into roadmap priorities",
            tag: "Analytics",
            tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            priority: "low",
            dueText: "Oct 08",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
        ],
      },
    ],
  },
  architecture: {
    role: "architecture",
    label: "System Architecture",
    sprintName: "Distributed Knowledge Engine v2",
    activeTasks: 11,
    columns: [
      {
        id: "arch-todo",
        title: "To do",
        count: 2,
        indicatorClass: "bg-neutral-400",
        cards: [
          {
            id: "arch-1",
            title: "Evaluate hybrid vector index vs pgvector HNSW",
            tag: "Infrastructure",
            tagColorClass: "bg-cyan-100 text-cyan-800 border-cyan-300",
            priority: "high",
            dueText: "Oct 19",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
      {
        id: "arch-progress",
        title: "In progress",
        count: 3,
        indicatorClass: "bg-primary-500",
        cards: [
          {
            id: "arch-2",
            title: "Design multi-region read-replica failover protocol",
            tag: "Database",
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
            priority: "high",
            dueText: "Today",
            assigneeInitials: "AM",
            assigneeBgClass: "bg-primary-600",
          },
          {
            id: "arch-3",
            title: "Audit zero-trust IAM policies & service mesh mTLS",
            tag: "Security",
            tagColorClass: "bg-red-100 text-red-800 border-red-300",
            priority: "medium",
            dueText: "Oct 16",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
        ],
      },
      {
        id: "arch-review",
        title: "Review",
        count: 3,
        indicatorClass: "bg-warning-500",
        cards: [
          {
            id: "arch-4",
            title: "RFC 42: Real-time board sync event-sourcing model",
            tag: "Architecture RFC",
            tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
            priority: "high",
            dueText: "Today 5:00 PM",
            assigneeInitials: "Đ",
            assigneeBgClass: "bg-[#4F46E5]",
          },
        ],
      },
      {
        id: "arch-done",
        title: "Done",
        count: 3,
        indicatorClass: "bg-success-500",
        cards: [
          {
            id: "arch-5",
            title: "Benchmark Redis Pub/Sub vs Postgres LISTEN/NOTIFY",
            tag: "Benchmarking",
            tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
            priority: "low",
            dueText: "Oct 05",
            assigneeInitials: "DK",
            assigneeBgClass: "bg-[#0284C7]",
          },
        ],
      },
    ],
  },
  design: {
    role: "design",
    label: "UI/UX Design",
    sprintName: "Brand Design System & Interaction Tokens",
    activeTasks: 16,
    columns: [
      {
        id: "ds-todo",
        title: "To do",
        count: 4,
        indicatorClass: "bg-neutral-400",
        cards: [
          {
            id: "ds-1",
            title: "Conduct accessibility color contrast audit (WCAG AAA)",
            tag: "Accessibility",
            tagColorClass: "bg-blue-100 text-blue-800 border-blue-300",
            priority: "high",
            dueText: "Oct 16",
            assigneeInitials: "DK",
            assigneeBgClass: "bg-[#0284C7]",
          },
        ],
      },
      {
        id: "ds-progress",
        title: "In progress",
        count: 3,
        indicatorClass: "bg-primary-500",
        cards: [
          {
            id: "ds-2",
            title: "Design fluid Kanban micro-interactions & drag physics",
            tag: "Motion UI",
            tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
            priority: "high",
            dueText: "Today",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
          {
            id: "ds-3",
            title: "Figma Variables export & dark mode token mapping",
            tag: "Design Ops",
            tagColorClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
            priority: "medium",
            dueText: "Oct 15",
            assigneeInitials: "AM",
            assigneeBgClass: "bg-primary-600",
          },
        ],
      },
      {
        id: "ds-review",
        title: "Review",
        count: 2,
        indicatorClass: "bg-warning-500",
        cards: [
          {
            id: "ds-5",
            title: "Review mobile responsive navigation drawer & gestures",
            tag: "Mobile UX",
            tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
            priority: "high",
            dueText: "Today 2:00 PM",
            assigneeInitials: "CC",
            assigneeBgClass: "bg-[#7C3AED]",
          },
        ],
      },
      {
        id: "ds-done",
        title: "Done",
        count: 7,
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

  const sectionRef = React.useRef<HTMLElement>(null);
  const tabContainerRef = React.useRef<HTMLDivElement>(null);
  const indicatorRef = React.useRef<HTMLDivElement>(null);
  const boardContainerRef = React.useRef<HTMLDivElement>(null);

  const buttonRefs = React.useRef<Record<LandingTeamRole, HTMLButtonElement | null>>({
    software: null,
    product: null,
    architecture: null,
    design: null,
  });

  // GSAP: Animate the Segmented Sliding Pill when activeRole changes
  useGSAP(
    () => {
      const activeBtn = buttonRefs.current[activeRole];
      if (!activeBtn || !indicatorRef.current) return;

      if (isReducedMotion()) {
        gsap.set(indicatorRef.current, {
          x: activeBtn.offsetLeft,
          y: activeBtn.offsetTop,
          width: activeBtn.offsetWidth,
          height: activeBtn.offsetHeight,
          opacity: 1,
        });
        return;
      }

      gsap.to(indicatorRef.current, {
        x: activeBtn.offsetLeft,
        y: activeBtn.offsetTop,
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
        opacity: 1,
        duration: 0.35,
        ease: MOTION_TIMING.easeEnter,
      });

      // Smooth subtle cross-fade for the board preview
      if (boardContainerRef.current) {
        gsap.fromTo(
          boardContainerRef.current,
          { opacity: 0.6, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: MOTION_TIMING.easeEnter,
            clearProps: "transform,opacity",
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [activeRole] }
  );

  // ScrollTrigger reveal for the section
  useGSAP(
    () => {
      if (isReducedMotion()) return;

      gsap.fromTo(
        ".teams-header",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: MOTION_TIMING.easeEnter,
          scrollTrigger: {
            trigger: ".teams-header",
            start: "top 85%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        ".teams-board-wrapper",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: MOTION_TIMING.easeEnter,
          scrollTrigger: {
            trigger: ".teams-board-wrapper",
            start: "top 80%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-white border-t border-neutral-200 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="teams-header text-left mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Role-Based Workspaces
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            Every team works better in Nexora.
          </h2>
          <p className="mt-3 text-base text-neutral-600 sm:text-lg leading-relaxed max-w-2xl">
            Customized workflows, board views, and context for every team and department.
          </p>

          {/* Segmented Sliding Pill Control (Linear / macOS Style) */}
          <div
            ref={tabContainerRef}
            className="relative mt-8 flex flex-wrap items-center justify-start gap-1 p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/90 w-fit select-none"
          >
            {/* Sliding Pill Indicator */}
            <div
              ref={indicatorRef}
              className="pointer-events-none absolute top-0 left-0 rounded-xl bg-white shadow-sm border border-neutral-200/80 z-0 opacity-0"
            />

            <button
              ref={(el) => { buttonRefs.current.software = el; }}
              type="button"
              onClick={() => setActiveRole("software")}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer",
                activeRole === "software"
                  ? "text-neutral-900 font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Code className="h-3.5 w-3.5 text-primary-600" />
              <span>Software Engineering</span>
            </button>

            <button
              ref={(el) => { buttonRefs.current.product = el; }}
              type="button"
              onClick={() => setActiveRole("product")}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer",
                activeRole === "product"
                  ? "text-neutral-900 font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Compass className="h-3.5 w-3.5 text-[#059669]" />
              <span>Product Management</span>
            </button>

            <button
              ref={(el) => { buttonRefs.current.architecture = el; }}
              type="button"
              onClick={() => setActiveRole("architecture")}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer",
                activeRole === "architecture"
                  ? "text-neutral-900 font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Network className="h-3.5 w-3.5 text-[#D97706]" />
              <span>System Architecture</span>
            </button>

            <button
              ref={(el) => { buttonRefs.current.design = el; }}
              type="button"
              onClick={() => setActiveRole("design")}
              className={cn(
                "relative z-10 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors cursor-pointer",
                activeRole === "design"
                  ? "text-neutral-900 font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              <Palette className="h-3.5 w-3.5 text-[#7C3AED]" />
              <span>UI/UX Design</span>
            </button>
          </div>
        </div>

        {/* Dynamic Board Preview based on Selected Team */}
        <div ref={boardContainerRef} className="teams-board-wrapper mt-12">
          <MockKanbanBoard
            boardTitle={currentTeam.sprintName}
            customColumns={currentTeam.columns}
          />
        </div>
      </div>
    </section>
  );
};
