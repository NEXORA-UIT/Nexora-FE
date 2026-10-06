import * as React from "react";
import { MoreVertical, Archive, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { BoardActionMenuProps } from "@/types";

export const BoardActionMenu: React.FC<BoardActionMenuProps> = ({
  board,
  onArchive,
  onRestore,
  onDelete,
}) => {
  const isArchived = board.status === "archived";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          aria-label={`Actions for ${board.title}`}
          title="Board options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-44"
        onClick={(e) => e.stopPropagation()}
      >
        {!isArchived ? (
          <>
            <DropdownMenuItem onClick={() => {}}>
              <ExternalLink className="h-3.5 w-3.5 text-neutral-500" />
              <span>Open Board</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onArchive?.(board.id)}
              className="text-amber-700 hover:bg-amber-50 hover:text-amber-800 focus:bg-amber-50 focus:text-amber-800"
            >
              <Archive className="h-3.5 w-3.5 text-amber-600" />
              <span>Archive Board</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => onRestore?.(board.id)}
              className="text-primary-700 hover:bg-primary-50 hover:text-primary-800 focus:bg-primary-50 focus:text-primary-800"
            >
              <RotateCcw className="h-3.5 w-3.5 text-primary-600" />
              <span>Restore Board</span>
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  destructive
                  onClick={() => onDelete(board.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-error-600" />
                  <span>Delete Board</span>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
