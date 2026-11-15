import React from "react";
import { BookOpen } from "lucide-react";
import type { Citation } from "@/types";
import { cn } from "@/lib/utils";

export interface CitationsBlockProps {
  citations?: Citation[];
  className?: string;
}

export const CitationsBlock: React.FC<CitationsBlockProps> = ({ citations, className }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={cn("mt-2.5 pt-2.5 border-t border-neutral-100", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase mb-1.5">
        <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
        <span>Document Citations</span>
      </div>

      <div className="space-y-1.5">
        {citations.map((citation) => (
          <div
            key={citation.chunk_id}
            className="p-2 text-xs rounded-lg border border-neutral-200/60 bg-neutral-50/40"
          >
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-700 mb-0.5">
              <span className="truncate">{citation.source_title}</span>
              {citation.page && (
                <span className="text-neutral-400 shrink-0">Page {citation.page}</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 line-clamp-2 italic">
              &ldquo;{citation.snippet}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
