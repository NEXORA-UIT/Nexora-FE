import * as React from "react";
import {
  Clock,
  ChevronUp,
  Equal,
  ChevronDown,
  Layers,
  Search,
  Filter,
  Sparkles,
  MousePointer,
} from "lucide-react";
import type { MockBoardColumn } from "@/types";

interface MockKanbanBoardProps {
  customColumns?: MockBoardColumn[];
  boardTitle?: string;
}

const DEFAULT_COLUMNS: MockBoardColumn[] = [
  {
    id: "col-todo",
    title: "To do",
    count: 4,
    indicatorClass: "bg-neutral-400",
    cards: [
      {
        id: "c-1",
        title: "Setup Tailwind color tokens & WCAG AA contrast rules",
        tag: "Design System",
        tagColorClass: "bg-blue-100 text-blue-800 border-blue-300",
        priority: "medium",
        dueText: "Oct 12",
        assigneeInitials: "AM",
        assigneeBgClass: "bg-primary-600",
      },
      {
        id: "c-2",
        title: "Define auth schema validation & session rotation RFC",
        tag: "Backend",
        tagColorClass: "bg-purple-100 text-purple-800 border-purple-300",
        priority: "high",
        dueText: "Oct 13",
        assigneeInitials: "CC",
        assigneeBgClass: "bg-[#7C3AED]",
      },
    ],
  },
  {
    id: "col-progress",
    title: "In progress",
    count: 3,
    indicatorClass: "bg-primary-500",
    cards: [
      {
        id: "c-3",
        title: "Implement AI context retrieval & citation grounding",
        tag: "AI Engine",
        tagColorClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
        priority: "high",
        dueText: "Today",
        assigneeInitials: "Đ",
        assigneeBgClass: "bg-[#4F46E5]",
      },
      {
        id: "c-4",
        title: "Audit accessibility keyboard shortcuts and focus trap",
        tag: "Frontend",
        tagColorClass: "bg-sky-100 text-sky-800 border-sky-300",
        priority: "medium",
        dueText: "Oct 14",
        assigneeInitials: "DK",
        assigneeBgClass: "bg-[#0284C7]",
      },
    ],
  },
  {
    id: "col-review",
    title: "Review",
    count: 2,
    indicatorClass: "bg-warning-500",
    cards: [
      {
        id: "c-5",
        title: "Review OAuth rotation specs and security headers",
        tag: "Security",
        tagColorClass: "bg-amber-100 text-amber-800 border-amber-300",
        priority: "high",
        dueText: "Today 4:00 PM",
        assigneeInitials: "CC",
        assigneeBgClass: "bg-[#7C3AED]",
      },
    ],
  },
  {
    id: "col-done",
    title: "Done",
    count: 5,
    indicatorClass: "bg-success-500",
    cards: [
      {
        id: "c-6",
        title: "Landing page wireframe and interactive prototypes",
        tag: "Design",
        tagColorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
        priority: "low",
        dueText: "Oct 10",
        assigneeInitials: "Đ",
        assigneeBgClass: "bg-[#4F46E5]",
      },
      {
        id: "c-7",
        title: "Initialize Vitest & Playwright e2e test harness",
        tag: "DevOps",
        tagColorClass: "bg-neutral-100 text-neutral-800 border-neutral-300",
        priority: "low",
        dueText: "Oct 09",
        assigneeInitials: "AM",
        assigneeBgClass: "bg-primary-600",
      },
    ],
  },
];

export const MockKanbanBoard: React.FC<MockKanbanBoardProps> = ({
  customColumns,
  boardTitle = "Website Redesign / Sprint 42",
}) => {
  const columns = customColumns ?? DEFAULT_COLUMNS;

  return (
    <div className="relative mx-auto w-full max-w-6xl select-none">
      {/* -------------------------------------------------------------
          Vibrant Accent Framing (Inspired by Jira's Multi-Color Outline)
          ------------------------------------------------------------- */}
      <div className="absolute -top-2.5 -left-2.5 h-16 w-16 rounded-tl-3xl bg-[#7C3AED] -z-10" />
      <div className="absolute -top-2.5 -right-2.5 h-16 w-16 rounded-tr-3xl bg-[#F59E0B] -z-10" />
      <div className="absolute -bottom-2.5 -left-2.5 h-16 w-16 rounded-bl-3xl bg-[#10B981] -z-10" />
      <div className="absolute -bottom-2.5 -right-2.5 h-16 w-16 rounded-br-3xl bg-[#2563EB] -z-10" />

      {/* Main Board Container */}
      <div className="relative rounded-2xl border-2 border-neutral-200 bg-white shadow-2xl overflow-hidden">
        {/* 1. Browser-style Window Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-6">
          {/* Traffic lights & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#EF4444]" />
              <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
              <span className="h-3 w-3 rounded-full bg-[#10B981]" />
            </div>

            <div className="h-4 w-px bg-neutral-300 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
              <Layers className="h-4 w-4 text-primary-600" />
              <span>{boardTitle}</span>
              <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                Active Sprint
              </span>
            </div>
          </div>

          {/* Member avatars & Search */}
          <div className="flex items-center gap-3 pt-2 sm:pt-0">
            <div className="flex items-center -space-x-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white">
                Đ
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white ring-2 ring-white">
                CC
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0284C7] text-[10px] font-bold text-white ring-2 ring-white">
                AM
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981] text-[10px] font-bold text-white ring-2 ring-white">
                +3
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-400">
              <Search className="h-3 w-3" />
              <span>Filter tasks...</span>
              <Filter className="h-3 w-3 ml-1 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* 2. Board Columns Grid */}
        <div className="relative p-4 sm:p-6 bg-neutral-50/50 overflow-x-auto">
          {/* Simulated Live Collab Cursors (like Jira & Figma) */}
          <div className="pointer-events-none absolute top-12 left-1/3 z-20 hidden lg:flex items-center gap-1">
            <MousePointer className="h-4 w-4 text-[#7C3AED] fill-[#7C3AED]" />
            <span className="rounded-full bg-[#7C3AED] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Clara Chen (Reviewing)
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-16 right-1/4 z-20 hidden lg:flex items-center gap-1">
            <MousePointer className="h-4 w-4 text-[#0284C7] fill-[#0284C7]" />
            <span className="rounded-full bg-[#0284C7] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              Alex Morgan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[760px] lg:min-w-0">
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex flex-col rounded-xl border border-neutral-200 bg-neutral-100/60 p-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.indicatorClass}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      {col.title}
                    </span>
                  </div>
                  <span className="rounded-full bg-white border border-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                    {col.count}
                  </span>
                </div>

                {/* Cards in Column */}
                <div className="space-y-3">
                  {col.cards.map((card) => (
                    <div
                      key={card.id}
                      className="group rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
                    >
                      {/* Tag Chip & Priority */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${card.tagColorClass}`}
                        >
                          {card.tag}
                        </span>

                        <div className="flex items-center gap-1">
                          {card.priority === "high" && (
                            <span className="flex items-center text-[10px] font-bold text-error-600">
                              <ChevronUp className="h-3.5 w-3.5 stroke-[3]" />
                              High
                            </span>
                          )}
                          {card.priority === "medium" && (
                            <span className="flex items-center text-[10px] font-bold text-warning-700">
                              <Equal className="h-3.5 w-3.5 stroke-[3]" />
                              Med
                            </span>
                          )}
                          {card.priority === "low" && (
                            <span className="flex items-center text-[10px] font-bold text-neutral-500">
                              <ChevronDown className="h-3.5 w-3.5 stroke-[3]" />
                              Low
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Title */}
                      <p className="mt-2 text-xs font-semibold text-neutral-900 leading-snug line-clamp-2">
                        {card.title}
                      </p>

                      {/* Card Footer: Due Date, AI Sync badge, Avatar */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-neutral-100 pt-2 text-[10px] text-neutral-500">
                        <div className="flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3 text-neutral-400" />
                          <span>{card.dueText}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {card.id === "c-3" && (
                            <span
                              className="flex items-center gap-0.5 rounded bg-purple-50 px-1.5 py-0.5 font-bold text-[#7C3AED]"
                              title="Contextual AI tracking active"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              AI
                            </span>
                          )}
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-2xs ${card.assigneeBgClass}`}
                          >
                            {card.assigneeInitials}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
