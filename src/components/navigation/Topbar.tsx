import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Sparkles, ChevronDown, Layers, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { authApi } from "@/apis/auth.api";
import { UserMenu } from "./UserMenu";
import nexoraLogoSrc from "@/assets/logo/logo.png";
import { NotificationCenter } from "./NotificationCenter";
import {
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const activeWorkspace = useWorkspaceStore((state) => state.getActiveWorkspace());

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout, proceed with client cleanup
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full select-none items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      {/* Left: Brand Logo & Workspace Selector */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3.5">
        <Link to={ROUTES.HOME} className="flex shrink-0 items-center gap-2">
          <img
            src={nexoraLogoSrc}
            alt="Nexora Logo"
            className="h-6 w-6 rounded-md object-contain"
          />
          <span className="text-base font-bold tracking-tight text-neutral-900">Nexora</span>
        </Link>

        {/* Subtle Divider */}
        <div className="hidden h-4 w-px bg-neutral-200 sm:block" />

        {/* Workspace Dropdown Button */}
        <button
          type="button"
          className="hidden max-w-[200px] items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 sm:flex"
          onClick={() => navigate(ROUTES.BOARDS)}
          title={`Active Workspace: ${activeWorkspace?.name || "None"}`}
        >
          <Layers className="text-primary-600 h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{activeWorkspace?.name || "Select Workspace"}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-neutral-400" />
        </button>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* + Create Button */}
        <Button
          type="button"
          size="sm"
          className="shadow-xs h-8 gap-1 rounded-lg bg-primary-600 px-2.5 text-xs font-medium text-white hover:bg-primary-700 sm:px-3"
          onClick={() => navigate(ROUTES.BOARDS)}
          title="Create"
          aria-label="Create board"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        <NotificationCenter />

        {/* AI Assistant Quick Launcher */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shadow-xs h-8 gap-1.5 rounded-lg border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 sm:px-2.5"
          disabled
          title="AI Assistant is not implemented yet"
          aria-label="AI Assistant, not implemented"
        >
          <Sparkles className="text-primary-600 h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI unavailable</span>
        </Button>

        {/* User Account Menu Dropdown */}
        <UserMenu onLogoutClick={() => setShowLogoutConfirm(true)} />
      </div>

      <DialogRoot
        open={showLogoutConfirm}
        onOpenChange={(open) => {
          if (!open && !isLoggingOut) setShowLogoutConfirm(false);
        }}
      >
        <DialogContent
          size="sm"
          aria-labelledby="logout-confirm-title"
          onEscapeKeyDown={(event) => {
            if (isLoggingOut) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (isLoggingOut) event.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-50 text-error-600">
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <DialogTitle
                  id="logout-confirm-title"
                  className="text-base font-bold text-neutral-900"
                >
                  Confirm Sign Out
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs text-neutral-500">
                  Your current session will end.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm leading-relaxed text-neutral-600">
              Are you sure you want to sign out of Nexora? You will need to sign in again to access
              your Workspace.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="hover:bg-error-700 bg-error-600 text-white"
              disabled={isLoggingOut}
              onClick={() => void handleConfirmLogout()}
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </header>
  );
};
