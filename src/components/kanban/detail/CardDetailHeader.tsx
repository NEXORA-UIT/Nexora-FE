import * as React from "react";
import { MoreHorizontal, X, Link2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { KanbanCard, UpdateCardInput } from "@/types";

export interface CardDetailHeaderProps {
  card: KanbanCard;
  onUpdate: (payload: UpdateCardInput) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
  onClose: () => void;
}

export const CardDetailHeader: React.FC<CardDetailHeaderProps> = ({
  card,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(card.title);

  // Sync draft title when card changes
  React.useEffect(() => {
    setTitleDraft(card.title);
    setIsEditingTitle(false);
  }, [card.id, card.title]);

  const handleCommitTitle = async () => {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === card.title) {
      setTitleDraft(card.title);
      return;
    }
    try {
      await onUpdate({
        title: trimmed,
        updatedAt: card.updatedAt,
      });
    } catch {
      setTitleDraft(card.title);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Card link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    await onDelete(card.id);
  };

  return (
    <div className="space-y-3 pb-4 border-b border-neutral-200">
      {/* Top Bar: Code Badge + Options + Close */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-md border border-neutral-200/80 bg-neutral-100 px-2 py-0.5 font-mono text-xs font-semibold text-neutral-600">
          {card.code}
        </span>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                aria-label="Card options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Link2 className="h-3.5 w-3.5 text-neutral-500" />
                <span>Copy card link</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete card</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            aria-label="Close task details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editable Title */}
      <div>
        {isEditingTitle ? (
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleCommitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleCommitTitle();
              } else if (e.key === "Escape") {
                setTitleDraft(card.title);
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            className="w-full rounded-lg border border-primary-500 bg-white px-2 py-1 text-base font-semibold text-neutral-900 shadow-xs outline-none ring-2 ring-primary-500/20"
          />
        ) : (
          <h2
            onClick={() => setIsEditingTitle(true)}
            className="cursor-text rounded-lg px-2 py-1 -mx-2 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            title="Click to edit title"
          >
            {card.title}
          </h2>
        )}
      </div>
    </div>
  );
};
