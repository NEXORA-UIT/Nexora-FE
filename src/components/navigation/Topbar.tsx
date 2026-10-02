import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Sparkles,
  Bell,
  ChevronDown,
  Layers,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth.store";
import { authApi } from "@/apis/auth.api";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const displayName = user?.fullName || "Đạt";

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

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLogoutConfirm && !isLoggingOut) {
        setShowLogoutConfirm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutConfirm, isLoggingOut]);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6 select-none">
      {/* Left: Brand Logo & Workspace Selector */}
      <div className="flex items-center gap-3.5">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <img
            src={nexoraLogoSrc}
            alt="Nexora Logo"
            className="h-6 w-6 rounded-md object-contain"
          />
          <span className="text-base font-bold tracking-tight text-neutral-900">
            Nexora
          </span>
        </Link>

        {/* Subtle Divider */}
        <div className="h-4 w-px bg-neutral-200" />

        {/* Workspace Dropdown Button */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
          title="Switch Workspace"
        >
          <Layers className="h-3.5 w-3.5 text-primary-600" />
          <span>Core Platform</span>
          <ChevronDown className="h-3 w-3 text-neutral-400" />
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search projects, boards, tasks, members..."
            className="h-8 w-full rounded-lg border border-neutral-200 bg-neutral-50/70 pl-9 pr-9 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-500/20"
          />
          <div className="pointer-events-none absolute right-2.5 flex h-5 min-w-5 items-center justify-center rounded border border-neutral-200 bg-white px-1 text-[10px] font-medium text-neutral-400 select-none">
            /
          </div>
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div className="flex items-center gap-2">
        {/* + Create Button */}
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1 rounded-lg bg-primary-600 px-3 text-xs font-medium text-white shadow-xs hover:bg-primary-700"
          onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create</span>
        </Button>

        {/* AI Assistant Quick Launcher */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 shadow-xs"
          onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary-600" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error-500 ring-2 ring-white" />
        </button>

        {/* User Profile Pill */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-neutral-100 transition-colors"
          onClick={() => navigate(ROUTES.UNDER_DEVELOPMENT)}
          title={`User profile: ${displayName}`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 font-semibold text-primary-700 text-xs">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="h-7 w-7 rounded-lg object-cover"
              />
            ) : (
              <img
                src={nexoraLogoSrc}
                alt="Avatar"
                className="h-4 w-4 object-contain"
              />
            )}
          </div>
          <span className="text-xs font-semibold text-neutral-800">{displayName}</span>
        </button>

        {/* Sign Out Action Button */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-error-600 transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            if (!isLoggingOut) setShowLogoutConfirm(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-neutral-200/80 animate-in zoom-in-95 duration-150 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5 mb-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-error-50 text-error-600">
                <LogOut className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3
                  id="logout-confirm-title"
                  className="text-base font-bold text-neutral-900"
                >
                  Confirm Sign Out
                </h3>
                <p className="text-xs text-neutral-500">
                  Your current session will end
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-600 leading-relaxed">
              Are you sure you want to sign out of Nexora? You will need to sign in again to access your workspace.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium text-xs"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-xs"
                disabled={isLoggingOut}
                onClick={handleConfirmLogout}
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
