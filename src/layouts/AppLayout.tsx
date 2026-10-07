import * as React from "react";
import { Outlet } from "react-router-dom";
import { Topbar } from "@/components/navigation/Topbar";
import { Sidebar } from "@/components/navigation/Sidebar";
import type { AppLayoutProps } from "@/types";

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-neutral-900">
      {/* Pinned Top Navigation Bar */}
      <Topbar />

      {/* Main Workspace Body with Sidebar & Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
