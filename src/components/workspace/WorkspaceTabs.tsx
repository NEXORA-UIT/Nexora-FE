import * as React from "react";
import { cn } from "@/lib/utils";
import type { WorkspaceTabsProps, WorkspaceTabId } from "@/types";

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  activeTab,
  onTabChange,
  boardCount,
  memberCount,
}) => {
  const tabs: Array<{
    id: WorkspaceTabId;
    label: string;
    count?: number;
  }> = [
    { id: "overview", label: "Overview" },
    { id: "boards", label: "Boards", count: boardCount },
    { id: "members", label: "Members", count: memberCount },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="border-b border-neutral-200">
      <nav className="flex space-x-6 select-none" aria-label="Workspace tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "group relative inline-flex items-center gap-2 py-3 text-xs font-medium transition-colors outline-none",
                isActive
                  ? "text-primary-700 font-semibold"
                  : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold transition-colors",
                    isActive
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200/80"
                  )}
                >
                  {tab.count}
                </span>
              )}
              {/* Active Tab Underline Indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-600" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
