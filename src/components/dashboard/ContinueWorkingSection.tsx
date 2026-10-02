import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Kanban,
  Smartphone,
  Network,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import type { RecentBoardItem } from "@/types";

const RECENT_BOARDS: RecentBoardItem[] = [
  {
    id: "board-1",
    title: "Website Redesign",
    workspace: "Core Platform",
    lastAccessed: "20m ago",
    statusDescription: "Active sprint • 14 tasks left",
    progressPercent: 68,
    iconType: "kanban",
  },
  {
    id: "board-2",
    title: "Mobile Application",
    workspace: "Core Platform",
    lastAccessed: "1h ago",
    statusDescription: "Sprint backlog & execution",
    progressPercent: 82,
    iconType: "mobile",
  },
  {
    id: "board-3",
    title: "System Architecture",
    workspace: "Core Platform",
    lastAccessed: "Yesterday",
    statusDescription: "RFCs & architecture diagrams",
    progressPercent: 45,
    iconType: "architecture",
  },
];

export const ContinueWorkingSection: React.FC = () => {
  return (
    <div className="mt-8">
      {/* Header: Title & View All Boards Link */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            Continue working
          </h2>
          <p className="text-xs text-neutral-500">
            Recently accessed boards in Core Platform
          </p>
        </div>

        <Link
          to={ROUTES.UNDER_DEVELOPMENT}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
        >
          <span>View all boards (4)</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 3 Board Cards Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RECENT_BOARDS.map((board) => (
          <Link
            key={board.id}
            to={ROUTES.UNDER_DEVELOPMENT}
            className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm"
          >
            {/* Top: Icon + Time */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-2xs">
                  {board.iconType === "kanban" && (
                    <Kanban className="h-4.5 w-4.5 text-[#4F46E5]" />
                  )}
                  {board.iconType === "mobile" && (
                    <Smartphone className="h-4.5 w-4.5 text-[#2563EB]" />
                  )}
                  {board.iconType === "architecture" && (
                    <Network className="h-4.5 w-4.5 text-[#0284C7]" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-neutral-400">
                  {board.lastAccessed}
                </span>
              </div>

              {/* Workspace Context & Board Title */}
              <div className="mt-3.5">
                <p className="text-[11px] font-medium text-neutral-500">
                  {board.workspace} · Board
                </p>
                <h3 className="mt-0.5 text-sm font-bold text-neutral-900">
                  {board.title}
                </h3>
              </div>

              {/* Status Description */}
              <p className="mt-2 text-xs font-medium text-neutral-600">
                {board.statusDescription}
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
                <span>Progress</span>
                <span>{board.progressPercent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#4F46E5] transition-all"
                  style={{ width: `${board.progressPercent}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
