import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  Home,
  Kanban,
  CheckCircle2,
  Calendar,
  StickyNote,
  BookOpen,
  HelpCircle,
  Settings,
  Layers,
  Plus,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/apis/auth.api";
import { CreateWorkspaceModal } from "@/components/workspace";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { workspaces, activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore();
  const { user, clearAuth } = useAuthStore();

  const [isWorkspaceListOpen, setIsWorkspaceListOpen] = React.useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = React.useState(false);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    setIsWorkspaceListOpen(false);
    navigate(ROUTES.BOARDS);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout, proceed with client cleanup
    } finally {
      clearAuth();
      onClose();
      navigate(ROUTES.LOGIN);
    }
  };

  const navLinks = [
    { label: "Home", href: ROUTES.HOME, icon: Home },
    { label: "Boards", href: ROUTES.BOARDS, icon: Kanban },
    { label: "My Tasks", href: ROUTES.MY_TASKS, icon: CheckCircle2 },
    { label: "Calendar", href: ROUTES.CALENDAR, icon: Calendar },
    { label: "Quick Notes", href: ROUTES.QUICK_NOTES, icon: StickyNote },
    { label: "Knowledge Base", href: ROUTES.KNOWLEDGE_BASE, icon: BookOpen },
    { label: "Help & Guides", href: ROUTES.HELP, icon: HelpCircle },
    { label: "Settings", href: ROUTES.SETTINGS, icon: Settings },
  ];

  return (
    <>
      <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-neutral-950/45 backdrop-blur-[2px] transition-opacity" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 flex h-full w-[85vw] max-w-xs flex-col bg-white shadow-2xl border-r border-neutral-200 outline-none select-none transition-transform duration-300 ease-out"
          >
            {/* 1. Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
              <div className="flex items-center gap-2.5">
                <img
                  src={nexoraLogoSrc}
                  alt="Nexora Logo"
                  className="h-6 w-6 rounded-md object-contain"
                />
                <DialogPrimitive.Title className="text-base font-bold tracking-tight text-neutral-900">
                  Nexora
                </DialogPrimitive.Title>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 2. Workspace Selector */}
            <div className="border-b border-neutral-200 bg-neutral-50/50 p-3">
              <div className="flex items-center justify-between pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <span>Workspaces</span>
                <button
                  type="button"
                  onClick={() => setIsCreateWorkspaceOpen(true)}
                  className="flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-3 w-3" />
                  <span>New</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsWorkspaceListOpen(!isWorkspaceListOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white p-2.5 text-left shadow-2xs hover:border-neutral-300 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 font-bold text-xs">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-neutral-900">
                      {activeWorkspace?.name || "Select Workspace"}
                    </p>
                    <p className="truncate text-[10px] text-neutral-500">
                      {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200",
                    isWorkspaceListOpen && "rotate-90"
                  )}
                />
              </button>

              {/* Expandable Workspace Switcher List */}
              {isWorkspaceListOpen && (
                <div className="mt-2 space-y-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-xs max-h-40 overflow-y-auto">
                  {workspaces.map((ws) => {
                    const isSelected = ws.id === activeWorkspaceId;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSelectWorkspace(ws.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors",
                          isSelected
                            ? "bg-primary-50 font-bold text-primary-700"
                            : "text-neutral-700 hover:bg-neutral-100"
                        )}
                      >
                        <span className="truncate">{ws.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Main Navigation Links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <span className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Menu
              </span>
              <div className="mt-1 space-y-0.5">
                {navLinks.map(({ label, href, icon: Icon }) => {
                  const isActive =
                    href === ROUTES.HOME
                      ? location.pathname === ROUTES.HOME
                      : location.pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      to={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary-50 font-bold text-primary-700"
                          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-primary-600" : "text-neutral-500"
                        )}
                      />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 4. Footer & Profile */}
            <div className="shrink-0 border-t border-neutral-200 bg-neutral-50/70 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-2xs">
                    {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-neutral-900">
                      {user?.fullName || "User"}
                    </p>
                    <p className="truncate text-[10px] text-neutral-500">{user?.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200/60 hover:text-rose-600 transition-colors"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Modal for creating a new workspace directly from mobile drawer */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
    </>
  );
};
