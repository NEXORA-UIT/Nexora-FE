import * as React from "react";
import { toast } from "sonner";
import {
  FileText,
  Image as ImageIcon,
  File,
  Upload,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import type { KanbanCard, CardAttachment } from "@/types";
import { formatFileSize } from "@/utils/format";

export interface CardDetailAttachmentsProps {
  card: KanbanCard;
  onUploadAttachment?: (cardId: string, file: File) => Promise<void>;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  onDownloadAttachment?: (attachmentId: string) => Promise<Blob>;
  isLoadingAttachments?: boolean;
  attachmentsError?: string | null;
  onRetryAttachments?: () => void;
  isUploadingAttachment?: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  isWorkspaceOwner?: boolean;
}

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const CardDetailAttachments: React.FC<CardDetailAttachmentsProps> = ({
  card,
  onUploadAttachment,
  onDeleteAttachment,
  onDownloadAttachment,
  isLoadingAttachments = false,
  attachmentsError = null,
  onRetryAttachments,
  isUploadingAttachment = false,
  currentUserId,
  currentUserRole,
  isWorkspaceOwner = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const attachments = card.attachments || [];

  // Reset local state when switching cards
  React.useEffect(() => {
    setDeletingAttachmentId(null);
    setIsDeleting(false);
    setDownloadingId(null);
  }, [card.id]);

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

  const handleTriggerUpload = () => {
    if (isUploadingAttachment) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadAttachment) return;

    if (file.size === 0) {
      toast.error("File is empty (0 bytes).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 25MB limit.");
      return;
    }

    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error("File format not supported. Allowed formats: PDF, DOCX, TXT, PNG, JPG.");
      return;
    }

    try {
      await onUploadAttachment(card.id, file);
    } catch {
      // Error is handled with toast in parent hook
    }
  };

  const handleDownload = async (attachment: CardAttachment) => {
    if (!onDownloadAttachment || downloadingId === attachment.id) return;

    setDownloadingId(attachment.id);
    try {
      const blob = await onDownloadAttachment(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch {
      // Error is handled with toast in parent hook
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirmDelete = async (attachmentId: string) => {
    if (!onDeleteAttachment || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDeleteAttachment(attachmentId);
      setDeletingAttachmentId(null);
    } catch {
      // Retain confirmation on failure
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3 py-4 border-b border-neutral-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Attachments ({attachments.length})
        </h3>

        {/* Upload Trigger Button */}
        {onUploadAttachment ? (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              className="hidden"
              aria-label="Upload attachment file"
            />
            <button
              type="button"
              onClick={handleTriggerUpload}
              disabled={isUploadingAttachment}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              aria-label="Upload attachment"
            >
              {isUploadingAttachment ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" />
                  <span>+ Upload</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <span
            className="inline-flex cursor-not-allowed items-center gap-1 text-[11px] font-medium text-neutral-400"
            title="File upload is not configured."
          >
            <span>+ Upload</span>
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoadingAttachments ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 py-1">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50/60 p-2.5 animate-pulse">
              <div className="h-8 w-8 rounded-md bg-neutral-200 shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-3 w-3/4 rounded bg-neutral-200" />
                <div className="h-2.5 w-1/2 rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      ) : attachmentsError ? (
        /* Error Banner */
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{attachmentsError}</span>
          </div>
          {onRetryAttachments && (
            <button
              type="button"
              onClick={onRetryAttachments}
              className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-semibold text-red-700 border border-red-300 hover:bg-red-50 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      ) : attachments.length > 0 ? (
        /* Loaded Attachments Grid */
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {attachments.map((att) => {
            const canDelete = Boolean(
              onDeleteAttachment &&
                ((currentUserId &&
                  (att.userId === currentUserId || att.uploadedBy?.id === currentUserId)) ||
                  currentUserRole === "PM" ||
                  currentUserRole === "OWNER" ||
                  isWorkspaceOwner)
            );
            const isConfirmingDelete = deletingAttachmentId === att.id;
            const isDownloadingThis = downloadingId === att.id;

            return (
              <div
                key={att.id}
                className="flex flex-col rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-2.5 transition-colors hover:bg-neutral-50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200/70">
                    {getFileIcon(att.fileName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-neutral-800" title={att.fileName}>
                      {att.fileName}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {formatFileSize(att.fileSize)} · {att.uploadedBy?.name || "Unknown Member"}
                    </p>
                  </div>

                  {/* Actions: Download & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onDownloadAttachment && (
                      <button
                        type="button"
                        onClick={() => void handleDownload(att)}
                        disabled={isDownloadingThis}
                        className="rounded p-1 text-neutral-400 hover:text-primary-600 hover:bg-neutral-100 cursor-pointer disabled:opacity-50"
                        aria-label={`Download ${att.fileName}`}
                        title="Download attachment"
                      >
                        {isDownloadingThis ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-600" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          setDeletingAttachmentId(isConfirmingDelete ? null : att.id)
                        }
                        className="rounded p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        aria-label={`Delete ${att.fileName}`}
                        title="Delete attachment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Delete Confirmation */}
                {isConfirmingDelete && (
                  <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs flex items-center justify-between gap-2">
                    <span className="text-red-700 font-medium">Delete this file?</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDeletingAttachmentId(null)}
                        disabled={isDeleting}
                        className="px-2 py-0.5 text-[11px] rounded bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleConfirmDelete(att.id)}
                        disabled={isDeleting}
                        className="px-2 py-0.5 text-[11px] rounded bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                        aria-label="Confirm delete attachment"
                      >
                        {isDeleting && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-neutral-400 italic">No attachments uploaded.</p>
      )}
    </div>
  );
};
