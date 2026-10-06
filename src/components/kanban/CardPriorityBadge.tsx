import * as React from "react";
import { ChevronsUp, ChevronUp, Equal, ChevronDown } from "lucide-react";
import type { CardPriority } from "@/types";

export interface CardPriorityBadgeProps {
  priority: CardPriority;
}

export const CardPriorityBadge: React.FC<CardPriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case "URGENT":
      return (
        <span className="inline-flex items-center gap-0.5 rounded-md border border-error-200/70 bg-error-50 px-1.5 py-0.5 text-[11px] font-semibold text-error-700">
          <ChevronsUp className="h-3 w-3 text-error-600" />
          <span>Urgent</span>
        </span>
      );
    case "HIGH":
      return (
        <span className="inline-flex items-center gap-0.5 rounded-md border border-amber-200/70 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
          <ChevronUp className="h-3 w-3 text-amber-600" />
          <span>High</span>
        </span>
      );
    case "LOW":
      return (
        <span className="inline-flex items-center gap-0.5 rounded-md border border-neutral-200/70 bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-600">
          <ChevronDown className="h-3 w-3 text-neutral-500" />
          <span>Low</span>
        </span>
      );
    case "MEDIUM":
    default:
      return (
        <span className="inline-flex items-center gap-0.5 rounded-md border border-primary-200/70 bg-primary-50 px-1.5 py-0.5 text-[11px] font-semibold text-primary-700">
          <Equal className="h-3 w-3 text-primary-600" />
          <span>Medium</span>
        </span>
      );
  }
};
