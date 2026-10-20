import * as React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, CheckCircle2, House, Kanban, StickyNote } from "lucide-react";
import { Topbar } from "@/components/navigation/Topbar";
import { Sidebar } from "@/components/navigation/Sidebar";
import { useSession } from "@/hooks/useSession";
import { ROUTES } from "@/constants/routes";
import type { AppLayoutProps } from "@/types";

export const AppLayout: React.FC<AppLayoutProps> = () => {
  useSession();

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-neutral-900">
      {/* Pinned Top Navigation Bar */}
      <Topbar />

      {/* Main Workspace Body with Sidebar & Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {[
            { label: "Home", href: ROUTES.HOME, icon: House, end: true },
            { label: "Boards", href: ROUTES.BOARDS, icon: Kanban, end: false },
            { label: "Tasks", href: ROUTES.MY_TASKS, icon: CheckCircle2, end: true },
            { label: "Calendar", href: ROUTES.CALENDAR, icon: CalendarDays, end: true },
            { label: "Notes", href: ROUTES.QUICK_NOTES, icon: StickyNote, end: true },
          ].map(({ label, href, icon: Icon, end }) => (
            <NavLink key={href} to={href} end={end} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-medium transition ${isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-900"}`}>
              {({ isActive }) => <><Icon aria-hidden="true" className={`h-4 w-4 ${isActive ? "text-blue-700" : "text-slate-400"}`} /><span>{label}</span></>}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
