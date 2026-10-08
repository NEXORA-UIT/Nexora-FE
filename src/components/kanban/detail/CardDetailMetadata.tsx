import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  User as UserIcon,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CardPriorityBadge } from "../CardPriorityBadge";
import { CardTagBadge } from "../CardTagBadge";
import type {
  KanbanCard,
  KanbanList,
  BoardMember,
  ListCategory,
  CardPriority,
  UpdateCardInput,
} from "@/types";

export interface CardDetailMetadataProps {
  card: KanbanCard;
  lists: KanbanList[];
  members: BoardMember[];
  onStatusChange: (card: KanbanCard, targetCategory: ListCategory) => Promise<boolean>;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
}

const PRIORITIES: { value: CardPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

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

export const CardDetailMetadata: React.FC<CardDetailMetadataProps> = ({
  card,
  lists,
  members,
  onStatusChange,
  onUpdate,
}) => {
  // Determine current list and category
  const currentList = lists.find((l) => l.id === card.listId);
  const currentCategory: ListCategory = currentList?.category || "TODO";
  const activeCategoryConfig = CATEGORIES.find((c) => c.value === currentCategory) || CATEGORIES[0];

  const primaryAssignee = card.assignees[0];

  const handleSelectStatus = async (cat: ListCategory) => {
    if (cat === currentCategory) return;
    await onStatusChange(card, cat);
  };

  const handleSelectPriority = async (p: CardPriority) => {
    if (p === card.priority) return;
    await onUpdate({
      priority: p,
      updatedAt: card.updatedAt,
    });
  };

  const handleSelectAssignee = async (memberId: string) => {
    await onUpdate({
      assigneeIds: [memberId],
      updatedAt: card.updatedAt,
    });
  };

  const handleDateChange = async (field: "startDate" | "dueDate", value: string) => {
    const isoVal = value ? new Date(value).toISOString() : null;
    await onUpdate({
      [field]: isoVal,
      updatedAt: card.updatedAt,
    });
  };

  const formatDisplayDate = (isoString?: string | null) => {
    if (!isoString) return "Set date";
    try {
      return format(parseISO(isoString), "MMM d, yyyy");
    } catch {
      return isoString;
    }
  };

  const toInputDate = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      return format(parseISO(isoString), "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-y-3 py-4 text-xs sm:grid-cols-2 sm:gap-x-8 border-b border-neutral-200">
      {/* Column 1 */}
      <div className="space-y-3">
        {/* STATUS */}
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
                <DropdownMenuItem key={cat.value} onClick={() => void handleSelectStatus(cat.value)}>
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

        {/* PRIORITY */}
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
                <CardPriorityBadge priority={card.priority} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Select Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRIORITIES.map((p) => (
                <DropdownMenuItem key={p.value} onClick={() => void handleSelectPriority(p.value)}>
                  <CardPriorityBadge priority={p.value} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* ASSIGNEE */}
        <div className="flex items-center">
          <span className="flex w-28 items-center gap-1.5 font-medium text-neutral-500">
            <UserIcon className="h-3.5 w-3.5" />
            <span>Assignee</span>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {primaryAssignee ? (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                      {primaryAssignee.initials || primaryAssignee.name.charAt(0)}
                    </span>
                    <span>{primaryAssignee.name}</span>
                  </>
                ) : (
                  <span className="text-neutral-400">Unassigned</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Assign Member</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {members.map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => void handleSelectAssignee(m.id)}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                    {m.initials || m.name.charAt(0)}
                  </span>
                  <span>{m.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-3">
        {/* START DATE */}
        <div className="flex items-center">
          <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Start date</span>
          </span>
          <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
            <span>{formatDisplayDate(card.startDate)}</span>
            <input
              type="date"
              value={toInputDate(card.startDate)}
              onChange={(e) => void handleDateChange("startDate", e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>

        {/* DUE DATE */}
        <div className="flex items-center">
          <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Due date</span>
          </span>
          <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200/80 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
            <span>{formatDisplayDate(card.dueDate)}</span>
            <input
              type="date"
              value={toInputDate(card.dueDate)}
              onChange={(e) => void handleDateChange("dueDate", e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>

        {/* LABELS */}
        <div className="flex items-center">
          <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
            <Tag className="h-3.5 w-3.5" />
            <span>Labels</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {card.labels.map((lbl) => (
              <CardTagBadge key={lbl.id} label={lbl.name} />
            ))}
            <span
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-dashed border-neutral-200 px-1.5 py-0.5 text-[11px] text-neutral-400"
              title="Label management coming soon"
            >
              <span>+ Label</span>
              <HelpCircle className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
