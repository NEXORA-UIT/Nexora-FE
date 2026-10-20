import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { CreateWorkspaceModal } from "@/components/workspace";

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    workspaces,
    activeWorkspaceId,
    isLoading,
    isInitialized,
    fetchWorkspaces,
    setActiveWorkspaceId,
  } = useWorkspaceStore();

  const [expandedWorkspaces, setExpandedWorkspaces] = React.useState<Record<string, boolean>>({});
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialized) {
      void fetchWorkspaces();
    }
  }, [isInitialized, fetchWorkspaces]);

  // Ensure active workspace is expanded by default
  React.useEffect(() => {
    if (activeWorkspaceId) {
      setExpandedWorkspaces((prev) => ({
        ...prev,
        [activeWorkspaceId]: prev[activeWorkspaceId] ?? true,
      }));
    }
  }, [activeWorkspaceId]);

  const toggleWorkspaceExpanded = (id: string) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    setExpandedWorkspaces((prev) => ({ ...prev, [id]: true }));
    navigate(ROUTES.BOARDS);
  };

  const isHomeActive = location.pathname === ROUTES.HOME;
  const isBoardsActive = location.pathname === ROUTES.BOARDS;
  const isMyTasksActive = location.pathname === ROUTES.MY_TASKS;
  const isCalendarActive = location.pathname === ROUTES.CALENDAR;
  const isQuickNotesActive = location.pathname === ROUTES.QUICK_NOTES;
  const isKnowledgeActive = location.pathname === ROUTES.KNOWLEDGE_BASE;
  const isHelpActive = location.pathname === ROUTES.HELP;
  const isSettingsActive =
    location.pathname === ROUTES.SETTINGS ||
    location.pathname === ROUTES.PROFILE;

  return (
    <aside className="hidden md:flex h-[calc(100vh-3.5rem)] w-56 flex-col justify-between border-r border-neutral-200 bg-white px-3 py-4 select-none shrink-0 overflow-y-auto">
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
              to={ROUTES.MY_TASKS}
              className={cn("flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors", isMyTasksActive ? "bg-primary-50 font-semibold text-primary-700" : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={cn("h-4 w-4", isMyTasksActive ? "text-primary-600" : "text-neutral-500")} />
                <span>My Tasks</span>
              </div>
            </Link>

            <Link
              to={ROUTES.CALENDAR}
              className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors", isCalendarActive ? "bg-primary-50 font-semibold text-primary-700" : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")}
            >
              <Calendar className={cn("h-4 w-4", isCalendarActive ? "text-primary-600" : "text-neutral-500")} />
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
            {isLoading && workspaces.length === 0 ? (
              <div className="space-y-1 px-2.5 py-1">
                <div className="h-6 w-full animate-pulse rounded-md bg-neutral-100" />
                <div className="h-6 w-3/4 animate-pulse rounded-md bg-neutral-100" />
              </div>
            ) : workspaces.length === 0 ? (
              <div className="px-2.5 py-1 text-[11px] text-neutral-400">
                No workspaces found
              </div>
            ) : (
              workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId;
                const isExpanded = Boolean(expandedWorkspaces[ws.id]);
                const isArchived = ws.status === "archived";

                return (
                  <div key={ws.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          toggleWorkspaceExpanded(ws.id);
                        } else {
                          handleSelectWorkspace(ws.id);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                        isActive
                          ? "bg-neutral-100 text-neutral-900 font-bold"
                          : "text-neutral-700 hover:bg-neutral-50"
                      )}
                      title={ws.name}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderKanban
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isActive ? "text-primary-600" : "text-neutral-400"
                          )}
                        />
                        <span className="truncate">{ws.name}</span>
                        {isArchived && (
                          <span className="shrink-0 text-[9px] font-normal text-neutral-400">
                            (Archived)
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 shrink-0 text-neutral-400" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0 text-neutral-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 pl-4 space-y-0.5">
                        <Link
                          to={ROUTES.BOARDS}
                          onClick={() => {
                            if (!isActive) {
                              setActiveWorkspaceId(ws.id);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                            isActive && isBoardsActive
                              ? "bg-primary-50 font-semibold text-primary-700"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                          )}
                        >
                          <Kanban
                            className={cn(
                              "h-3.5 w-3.5",
                              isActive && isBoardsActive
                                ? "text-primary-600"
                                : "text-neutral-400"
                            )}
                          />
                          <span>Boards</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Add Workspace Action Button */}
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-neutral-400" />
              <span>Add Workspace</span>
            </button>
          </div>
        </div>

        {/* Create Workspace Modal */}
        <CreateWorkspaceModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(newId) => {
            navigate(ROUTES.BOARDS);
            setExpandedWorkspaces((prev) => ({ ...prev, [newId]: true }));
          }}
        />

        {/* Section 3: TOOLS */}
        <div>
          <span className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Tools
          </span>
          <nav className="mt-2 space-y-1">
            <Link
              to={ROUTES.QUICK_NOTES}
              className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors", isQuickNotesActive ? "bg-primary-50 font-semibold text-primary-700" : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")}
            >
              <StickyNote className={cn("h-4 w-4", isQuickNotesActive ? "text-primary-600" : "text-neutral-500")} />
              <span>Quick Notes</span>
            </Link>
            <Link
              to={ROUTES.KNOWLEDGE_BASE}
              className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors", isKnowledgeActive ? "bg-primary-50 font-semibold text-primary-700" : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")}
            >
              <BookOpen className={cn("h-4 w-4", isKnowledgeActive ? "text-primary-600" : "text-neutral-500")} />
              <span>Knowledge Base</span>
            </Link>

            <Link
              to={ROUTES.AI_ASSISTANT}
              aria-label="AI Assistant, not implemented"
              className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              <span className="flex items-center gap-2.5"><Sparkles className="h-4 w-4 text-neutral-400" /><span>AI Assistant</span></span>
              <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-500">Not ready</span>
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
            className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors", isHelpActive ? "bg-primary-50 font-semibold text-primary-700" : "font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900")}
          >
            <HelpCircle className={cn("h-4 w-4", isHelpActive ? "text-primary-600" : "text-neutral-500")} />
            <span>Help & Docs</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
};
