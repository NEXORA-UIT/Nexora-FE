import * as React from "react";
import { Database, FileText, CheckCircle2, Layers } from "lucide-react";
import type { KnowledgeDocument } from "@/types/knowledge-base";

export interface BoardOption {
  id: string;
  title: string;
}

export interface BoardSelectorHeaderProps {
  boards: BoardOption[];
  activeBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  documents: KnowledgeDocument[];
  className?: string;
}

export const BoardSelectorHeader: React.FC<BoardSelectorHeaderProps> = ({
  boards,
  activeBoardId,
  onSelectBoard,
  documents,
  className = "",
}) => {
  const readyCount = documents.filter((d) => d.status === "READY").length;
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Banner & Board Dropdown */}
      <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-purple-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                Vector Knowledge Index
              </span>
              <span className="rounded-full bg-blue-100/80 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                Board-Scoped
              </span>
            </div>
            <p className="text-xs text-neutral-600">
              Documents are partitioned by board for focused, secure AI Copilot citations.
            </p>
          </div>
        </div>

        {/* Board Dropdown Selector */}
        {boards.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label htmlFor="kb-board-select" className="text-xs font-semibold text-neutral-700 shrink-0">
              Board:
            </label>
            <div className="relative">
              <select
                id="kb-board-select"
                aria-label="Select board"
                value={activeBoardId || ""}
                onChange={(e) => onSelectBoard(e.target.value)}
                className="h-9 min-w-[180px] rounded-xl border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-800 shadow-2xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-500">Total Documents</p>
            <p className="text-sm font-bold text-neutral-900">{documents.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-500">Indexed & Ready</p>
            <p className="text-sm font-bold text-emerald-700">{readyCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-3 shadow-2xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-neutral-500">Vector Chunks</p>
            <p className="text-sm font-bold text-purple-700">{totalChunks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
