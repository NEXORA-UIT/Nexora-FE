import * as React from "react";
import { Link } from "react-router-dom";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { UpcomingTimelineItem } from "@/types";

const UPCOMING_ITEMS: UpcomingTimelineItem[] = [
  {
    id: "item-1",
    badge: {
      topText: "TODAY",
      bottomText: "11",
      isPrimary: true,
    },
    timeCategory: "4:00 PM • Core Platform",
    title: "Review software requirements & specs",
  },
  {
    id: "item-2",
    badge: {
      topText: "THU",
      bottomText: "12",
      isPrimary: false,
    },
    timeCategory: "10:00 AM • Team meeting",
    title: "Sprint 42 Planning & Backlog Grooming",
  },
  {
    id: "item-3",
    badge: {
      topText: "OCT",
      bottomText: "15",
      isPrimary: false,
    },
    timeCategory: "End of day • Milestone",
    title: "Submit SRS document & schema review",
  },
  {
    id: "item-4",
    badge: {
      topText: "OCT",
      bottomText: "18",
      isPrimary: false,
    },
    timeCategory: "Core Platform Release",
    title: "Beta Deployment Release v2.0",
  },
];

export const UpcomingSection: React.FC = () => {
  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs sm:p-6">
      {/* Header: Title & Calendar Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-neutral-500" />
          <h2 className="text-sm font-bold text-neutral-900">Upcoming</h2>
        </div>

        <Link
          to={ROUTES.UNDER_DEVELOPMENT}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
        >
          <span>Calendar</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Timeline Items */}
      <div className="mt-4 space-y-3.5">
        {UPCOMING_ITEMS.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            {/* Styled Date Box Badge */}
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center select-none shadow-2xs",
                item.badge.isPrimary
                  ? "bg-primary-600 text-white"
                  : "border border-neutral-200 bg-neutral-50 text-neutral-600"
              )}
            >
              <span
                className={cn(
                  "text-[9px] font-bold tracking-tight uppercase leading-none",
                  item.badge.isPrimary ? "text-primary-100" : "text-neutral-400"
                )}
              >
                {item.badge.topText}
              </span>
              <span className="text-sm font-extrabold leading-tight">
                {item.badge.bottomText}
              </span>
            </div>

            {/* Time / Category & Title */}
            <div className="min-w-0 flex-1 pt-0.5">
              <span className="block text-[11px] font-medium text-neutral-400 truncate">
                {item.timeCategory}
              </span>
              <span className="block text-xs font-semibold text-neutral-800 truncate">
                {item.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
