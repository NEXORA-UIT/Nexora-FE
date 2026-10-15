import * as React from "react";
import { AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CardPriorityBadge } from "../../CardPriorityBadge";
import type { CardPriority, UpdateCardInput } from "@/types";

export interface CardPrioritySelectorProps {
  priority: CardPriority;
  cardUpdatedAt: string;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
}

const PRIORITIES: { value: CardPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export const CardPrioritySelector: React.FC<CardPrioritySelectorProps> = ({
  priority,
  cardUpdatedAt,
  onUpdate,
}) => {
  const handleSelectPriority = async (p: CardPriority) => {
    if (p === priority) return;
    await onUpdate({
      priority: p,
      updatedAt: cardUpdatedAt,
    });
  };

  return (
    <div className="flex items-center">
      <span className="flex w-28 items-center gap-1.5 font-medium text-neutral-500">
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Priority</span>
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center rounded-md transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <CardPriorityBadge priority={priority} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Select Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {PRIORITIES.map((p) => (
            <DropdownMenuItem
              key={p.value}
              onClick={() => void handleSelectPriority(p.value)}
            >
              <CardPriorityBadge priority={p.value} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
