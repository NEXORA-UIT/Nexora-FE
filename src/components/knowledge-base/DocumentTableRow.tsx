import * as React from "react";
import { Download, FileCode, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import type { KnowledgeDocument } from "@/types/knowledge-base";

export interface DocumentTableRowProps {
  document: KnowledgeDocument;
  onDelete: (id: string) => void;
  onDownload: (doc: KnowledgeDocument) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(ext: string) {
  switch (ext.toLowerCase()) {
    case "pdf":
      return <FileText className="h-5 w-5 text-rose-500" />;
    case "docx":
    case "doc":
      return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
    default:
      return <FileCode className="h-5 w-5 text-neutral-500" />;
  }
}

export const DocumentTableRow: React.FC<DocumentTableRowProps> = ({
  document,
  onDelete,
  onDownload,
}) => {
  const formattedDate = React.useMemo(() => {
    try {
      return format(parseISO(document.createdAt), "MMM d, yyyy");
    } catch {
      return "Recent";
    }
  }, [document.createdAt]);

  return (
    <tr className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors">
      {/* File Name & Icon */}
      <td className="py-3.5 pl-4 pr-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200/80 bg-neutral-50">
            {getFileIcon(document.fileExtension)}
          </div>
          <div className="min-w-0 max-w-[280px] sm:max-w-xs md:max-w-md">
            <p className="truncate font-semibold text-neutral-900" title={document.fileName}>
              {document.fileName}
            </p>
            <p className="text-[11px] text-neutral-500">
              {document.chunkCount ? `${document.chunkCount} chunks` : "Pending indexing"} ·{" "}
              {document.uploadedBy || "Team member"}
            </p>
          </div>
        </div>
      </td>

      {/* File Size */}
      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-neutral-600">
        {formatFileSize(document.fileSize)}
      </td>

      {/* Upload Date */}
      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-neutral-500">
        {formattedDate}
      </td>

      {/* Status Badge */}
      <td className="whitespace-nowrap px-3 py-3.5">
        <DocumentStatusBadge status={document.status} />
      </td>

      {/* Actions */}
      <td className="whitespace-nowrap py-3.5 pl-3 pr-4 text-right text-xs">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onDownload(document)}
            aria-label={`Download ${document.fileName}`}
            title="Download document"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(document.id)}
            aria-label={`Delete ${document.fileName}`}
            title="Delete document"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
