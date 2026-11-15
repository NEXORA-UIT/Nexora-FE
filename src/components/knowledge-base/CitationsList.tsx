import * as React from "react";
import { BookOpen } from "lucide-react";
import type { RAGCitation } from "@/types/knowledge-base";

export interface CitationsListProps {
  citations: RAGCitation[];
  className?: string;
}

export const CitationsList: React.FC<CitationsListProps> = ({ citations, className = "" }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={`mt-3 pt-3 border-t border-neutral-100 ${className}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase mb-2">
        <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
        <span>Document Citations ({citations.length})</span>
      </div>

      <div className="space-y-2">
        {citations.map((citation, idx) => (
          <div
            key={citation.chunkId || `cit-${idx}`}
            className="p-2.5 text-xs rounded-xl border border-neutral-200/70 bg-neutral-50/60 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-800 mb-1">
              <span className="truncate max-w-[80%]" title={citation.fileName}>
                📄 {citation.fileName}
              </span>
              {citation.pageNumber != null && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-200/70 text-neutral-600 shrink-0">
                  Page {citation.pageNumber}
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed italic line-clamp-3">
              “{citation.snippet}”
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
