import * as React from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  User as UserIcon,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Check,
  Loader2,
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
  BoardLabel,
} from "@/types";

export interface CardDetailMetadataProps {
  card: KanbanCard;
  lists: KanbanList[];
  members: BoardMember[];
  onStatusChange: (card: KanbanCard, targetCategory: ListCategory) => Promise<boolean>;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
  onAssignMember?: (cardId: string, userId: string) => Promise<void>;
  onUnassignMember?: (cardId: string, userId: string) => Promise<void>;
  isLoadingAssignments?: boolean;
  assignmentsError?: string | null;
  onRetryAssignments?: () => void;
  boardLabels?: BoardLabel[];
  onAttachLabel?: (cardId: string, labelId: string) => Promise<void>;
  onDetachLabel?: (cardId: string, labelId: string) => Promise<void>;
  isLoadingLabels?: boolean;
  labelsError?: string | null;
  onRetryLabels?: () => void;
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
  onAssignMember,
  onUnassignMember,
  isLoadingAssignments = false,
  assignmentsError = null,
  onRetryAssignments,
  boardLabels = [],
  onAttachLabel,
  onDetachLabel,
  isLoadingLabels = false,
  labelsError = null,
  onRetryLabels,
}) => {
  const [pendingUserId, setPendingUserId] = React.useState<string | null>(null);
  const [pendingLabelId, setPendingLabelId] = React.useState<string | null>(null);
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

  const handleToggleAssignee = async (member: BoardMember, isAssigned: boolean) => {
    if (pendingUserId) return;
    setPendingUserId(member.id);
    try {
      if (isAssigned) {
        if (onUnassignMember) {
          await onUnassignMember(card.id, member.id);
        }
      } else {
        if (onAssignMember) {
          await onAssignMember(card.id, member.id);
        }
      }
    } catch {
      // Error is surfaced via hook notification / assignmentsError
    } finally {
      setPendingUserId(null);
    }
  };

  const handleToggleLabel = async (boardLabel: BoardLabel, isAttached: boolean) => {
    if (pendingLabelId) return;
    setPendingLabelId(boardLabel.id);
    try {
      if (isAttached) {
        if (onDetachLabel) {
          await onDetachLabel(card.id, boardLabel.id);
        }
      } else {
        if (onAttachLabel) {
          await onAttachLabel(card.id, boardLabel.id);
        }
      }
    } catch {
      // Error is surfaced via hook notification / labelsError
    } finally {
      setPendingLabelId(null);
    }
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <span className="flex w-28 items-center gap-1.5 font-medium text-neutral-500">
              <UserIcon className="h-3.5 w-3.5" />
              <span>Assignee</span>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isLoadingAssignments}
                  aria-label="Assign member"
                  className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200/80 bg-neutral-50/80 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60"
                >
                  {isLoadingAssignments ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                  ) : card.assignees.length === 0 ? (
                    <>
                      <UserIcon className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-neutral-500">Unassigned</span>
                    </>
                  ) : card.assignees.length === 1 ? (
                    <>
                      {primaryAssignee.avatarUrl ? (
                        <img
                          src={primaryAssignee.avatarUrl}
                          alt={primaryAssignee.name}
                          className="h-4 w-4 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[9px] font-semibold text-primary-700">
                          {primaryAssignee.initials || primaryAssignee.name.charAt(0)}
                        </span>
                      )}
                      <span className="truncate max-w-[120px]">{primaryAssignee.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="flex -space-x-1.5 items-center shrink-0">
                        {card.assignees.slice(0, 2).map((a) => (
                          <span
                            key={a.id}
                            className="flex h-4 w-4 items-center justify-center rounded-full border border-white bg-primary-100 text-[8px] font-semibold text-primary-700"
                          >
                            {a.initials || a.name.charAt(0)}
                          </span>
                        ))}
                      </div>
                      <span className="truncate max-w-[100px]">{primaryAssignee.name}</span>
                      <span className="text-[10px] text-neutral-500 font-medium">+{card.assignees.length - 1}</span>
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60 max-h-72 overflow-y-auto">
                <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">
                  Assign Members
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {members.length === 0 ? (
                  <div className="px-2 py-3 text-center text-xs text-neutral-400">
                    No board members available
                  </div>
                ) : (
                  members.map((m) => {
                    const isAssigned = card.assignees.some((a) => a.id === m.id);
                    const isPending = pendingUserId === m.id;
                    return (
                      <DropdownMenuItem
                        key={m.id}
                        disabled={Boolean(pendingUserId)}
                        onSelect={(e) => {
                          e.preventDefault();
                          void handleToggleAssignee(m, isAssigned);
                        }}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {m.avatarUrl ? (
                            <img
                              src={m.avatarUrl}
                              alt={m.name}
                              className="h-5 w-5 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                              {m.initials || m.name.charAt(0)}
                            </span>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="truncate font-medium text-neutral-800">{m.name}</span>
                            {m.role && (
                              <span className="text-[10px] text-neutral-400 leading-tight">
                                {m.role}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center w-4 h-4 justify-center">
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                          ) : isAssigned ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : null}
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Assignments Error / Retry Banner */}
          {assignmentsError && (
            <div className="flex items-center gap-1.5 pl-28 text-[11px] text-amber-700">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span className="truncate">{assignmentsError}</span>
              {onRetryAssignments && (
                <button
                  type="button"
                  onClick={onRetryAssignments}
                  className="font-medium underline hover:text-amber-800 shrink-0"
                >
                  Retry
                </button>
              )}
            </div>
          )}
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <span className="flex w-24 items-center gap-1.5 font-medium text-neutral-500">
              <Tag className="h-3.5 w-3.5" />
              <span>Labels</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {card.labels.map((lbl) => (
                <CardTagBadge key={lbl.id} label={lbl.name} color={lbl.color} />
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoadingLabels}
                    aria-label="Manage labels"
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60"
                  >
                    {isLoadingLabels ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin text-neutral-400" />
                    ) : (
                      <span>+ Label</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
                  <DropdownMenuLabel className="text-xs text-neutral-500 font-normal">
                    Board Labels
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {boardLabels.length === 0 ? (
                    <div className="px-2 py-3 text-center text-xs text-neutral-400">
                      No board labels available
                    </div>
                  ) : (
                    boardLabels.map((lbl) => {
                      const isAttached = card.labels.some((l) => l.id === lbl.id);
                      const isPending = pendingLabelId === lbl.id;
                      return (
                        <DropdownMenuItem
                          key={lbl.id}
                          disabled={Boolean(pendingLabelId)}
                          onSelect={(e) => {
                            e.preventDefault();
                            void handleToggleLabel(lbl, isAttached);
                          }}
                          className="flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {lbl.color && (
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: lbl.color }}
                              />
                            )}
                            <span className="truncate font-medium text-neutral-800">
                              {lbl.name}
                            </span>
                          </div>
                          <div className="shrink-0 flex items-center w-4 h-4 justify-center">
                            {isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
                            ) : isAttached ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : null}
                          </div>
                        </DropdownMenuItem>
                      );
                    })
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Labels Error / Retry Banner */}
          {labelsError && (
            <div className="flex items-center gap-1.5 pl-24 text-[11px] text-amber-700">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span className="truncate">{labelsError}</span>
              {onRetryLabels && (
                <button
                  type="button"
                  onClick={onRetryLabels}
                  className="font-medium underline hover:text-amber-800 shrink-0"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
