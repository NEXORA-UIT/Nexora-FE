import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Sparkles,
  Bell,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import nexoraLogoSrc from "@/assets/logo/logo.png";

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState("");

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
          title="User profile: Đạt"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 font-semibold text-primary-700 text-xs">
            <img
              src={nexoraLogoSrc}
              alt="Avatar"
              className="h-4 w-4 object-contain"
            />
          </div>
          <span className="text-xs font-semibold text-neutral-800">Đạt</span>
        </button>
      </div>
    </header>
  );
};
