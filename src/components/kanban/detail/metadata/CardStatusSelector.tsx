import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { KanbanCard, KanbanList, ListCategory } from "@/types";

export interface CardStatusSelectorProps {
  card: KanbanCard;
  lists: KanbanList[];
  onStatusChange: (card: KanbanCard, targetCategory: ListCategory) => Promise<boolean>;
}

const CATEGORIES: { value: ListCategory; label: string; badgeStyle: string }[] = [
  {
    value: "TODO",
    label: "TO DO",
    badgeStyle: "bg-neutral-100 text-neutral-700 border-neutral-200",
  },
  {
    value: "IN_PROGRESS",
    label: "IN PROGRESS",
    badgeStyle: "bg-primary-50 text-primary-700 border-primary-200",
  },
  {
    value: "DONE",
    label: "DONE",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export const CardStatusSelector: React.FC<CardStatusSelectorProps> = ({
  card,
  lists,
  onStatusChange,
}) => {
  const currentList = lists.find((l) => l.id === card.listId);
  const currentCategory: ListCategory = currentList?.category || "TODO";
  const activeCategoryConfig =
    CATEGORIES.find((c) => c.value === currentCategory) || CATEGORIES[0];

  const handleSelectStatus = async (cat: ListCategory) => {
    if (cat === currentCategory) return;
    await onStatusChange(card, cat);
  };

  return (
    <div className="flex items-center">
      <span className="flex w-28 items-center gap-1.5 font-medium text-neutral-500">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Status</span>
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${activeCategoryConfig.badgeStyle}`}
          >
            <span>{activeCategoryConfig.label}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Workflow Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {CATEGORIES.map((cat) => (
            <DropdownMenuItem
              key={cat.value}
              onClick={() => void handleSelectStatus(cat.value)}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  cat.value === "DONE"
                    ? "bg-emerald-500"
                    : cat.value === "IN_PROGRESS"
                    ? "bg-primary-500"
                    : "bg-neutral-400"
                }`}
              />
              <span>{cat.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
