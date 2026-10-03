import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Kanban,
  BookOpen,
  Sparkles,
  Settings,
  HelpCircle,
  FolderKanban,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [corePlatformExpanded, setCorePlatformExpanded] = React.useState(true);

  const isHomeActive = location.pathname === ROUTES.HOME;
  const isSettingsActive =
    location.pathname === ROUTES.SETTINGS ||
    location.pathname === ROUTES.PROFILE;

  return (
    <aside className="flex h-[calc(100vh-3.5rem)] w-56 flex-col justify-between border-r border-neutral-200 bg-white px-3 py-4 select-none shrink-0 overflow-y-auto">
      {/* Top Navigation Sections */}
      <div className="space-y-6">
        {/* Section 1: MENU */}
        <div>
          <span className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Menu
          </span>
          <nav className="mt-2 space-y-1">
            <Link
              to={ROUTES.HOME}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors",
                isHomeActive
                  ? "bg-primary-50 font-semibold text-primary-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Home className={cn("h-4 w-4", isHomeActive ? "text-primary-600" : "text-neutral-500")} />
              <span>Home</span>
            </Link>

            <Link
              to={ROUTES.UNDER_DEVELOPMENT}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-neutral-500" />
                <span>My Tasks</span>
              </div>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[11px] font-semibold text-primary-700">
                6
              </span>
            </Link>

            <Link
              to={ROUTES.UNDER_DEVELOPMENT}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <Calendar className="h-4 w-4 text-neutral-500" />
              <span>Calendar</span>
            </Link>
          </nav>
        </div>

        {/* Section 2: WORKSPACES */}
        <div>
          <span className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Workspaces
          </span>
          <div className="mt-2 space-y-1">
            {/* Core Platform Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setCorePlatformExpanded(!corePlatformExpanded)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-3.5 w-3.5 text-primary-600" />
                  <span>Core Platform</span>
                </div>
                {corePlatformExpanded ? (
                  <ChevronDown className="h-3 w-3 text-neutral-400" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-neutral-400" />
                )}
              </button>

              {corePlatformExpanded && (
                <div className="mt-1 pl-4 space-y-0.5">
                  <Link
                    to={ROUTES.UNDER_DEVELOPMENT}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <Kanban className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Boards</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Add Workspace */}
            <Link
              to={ROUTES.UNDER_DEVELOPMENT}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-neutral-400" />
              <span>Add Workspace</span>
            </Link>
          </div>
        </div>

        {/* Section 3: TOOLS */}
        <div>
          <span className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Tools
          </span>
          <nav className="mt-2 space-y-1">
            <Link
              to={ROUTES.UNDER_DEVELOPMENT}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-neutral-500" />
              <span>Knowledge Base</span>
            </Link>

            <Link
              to={ROUTES.UNDER_DEVELOPMENT}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-neutral-500" />
              <span>AI Assistant</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Pinned: SYSTEM */}
      <div className="border-t border-neutral-200/80 pt-3">
        <span className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          System
        </span>
        <nav className="mt-1.5 space-y-0.5">
          <Link
            to={ROUTES.SETTINGS}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors",
              isSettingsActive
                ? "bg-primary-600 font-medium text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            <Settings
              className={cn(
                "h-4 w-4",
                isSettingsActive ? "text-white" : "text-neutral-500"
              )}
            />
            <span>Settings</span>
          </Link>
          <Link
            to={ROUTES.HELP}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-neutral-500" />
            <span>Help & Docs</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
};
