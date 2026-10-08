import * as React from "react";
import { Lock, FolderArchive } from "lucide-react";
import { BoardActionMenu } from "./BoardActionMenu";
import type { ArchivedBoardCardProps } from "@/types";

export const ArchivedBoardCard: React.FC<ArchivedBoardCardProps> = ({
  board,
  onRestore,
  onDelete,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick?.(board)}
      className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-neutral-50/50 p-5 shadow-xs transition-all hover:border-neutral-300 hover:bg-white select-none"
    >
      <div>
        {/* Top: Status Badge & Action Menu */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-600 shadow-2xs">
            <Lock className="h-3 w-3 text-neutral-400" />
            <span>Archived · Read-only</span>
          </span>

          <BoardActionMenu
            board={board}
            onRestore={onRestore}
            onDelete={onDelete}
          />
        </div>

        {/* Board Title */}
        <h3 className="mt-2.5 text-sm font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
          {board.title}
        </h3>

        {/* Description */}
        <p className="mt-1 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
          {board.description}
        </p>
      </div>

      {/* Bottom Footer: Historical Note & Restore Action */}
      <div className="mt-6 flex items-center justify-between border-t border-neutral-200/70 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <FolderArchive className="h-3.5 w-3.5 text-neutral-400" />
          <span>Historical tasks preserved</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRestore(board.id);
          }}
          className="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-100 hover:text-primary-800 transition-colors"
          title="Restore this board"
        >
          Restore
        </button>
      </div>
    </div>
  );
};
