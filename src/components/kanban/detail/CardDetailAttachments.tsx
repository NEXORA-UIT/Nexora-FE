import * as React from "react";
import { FileText, Image as ImageIcon, File, HelpCircle } from "lucide-react";
import type { KanbanCard } from "@/types";

export interface CardDetailAttachmentsProps {
  card: KanbanCard;
}

export const CardDetailAttachments: React.FC<CardDetailAttachmentsProps> = ({ card }) => {
  const attachments = card.attachments || [];

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp" || ext === "svg") {
      return <ImageIcon className="h-4 w-4 text-primary-600" />;
    }
    if (ext === "doc" || ext === "docx" || ext === "pdf" || ext === "txt") {
      return <FileText className="h-4 w-4 text-amber-600" />;
    }
    return <File className="h-4 w-4 text-neutral-500" />;
  };

  return (
    <div className="space-y-3 py-4 border-b border-neutral-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Attachments ({attachments.length})
        </h3>

        {/* Read-only + Upload indicator */}
        <span
          className="inline-flex cursor-not-allowed items-center gap-1 text-[11px] font-medium text-neutral-400"
          title="Cloud storage upload in development"
        >
          <span>+ Upload</span>
          <HelpCircle className="h-2.5 w-2.5" />
        </span>
      </div>

      {attachments.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5 transition-colors hover:bg-neutral-50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200/70">
                {getFileIcon(att.fileName)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-800" title={att.fileName}>
                  {att.fileName}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {att.fileSize} · {att.uploadedBy.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 italic">No attachments uploaded.</p>
      )}
    </div>
  );
};
