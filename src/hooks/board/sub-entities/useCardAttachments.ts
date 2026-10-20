import * as React from "react";
import { toast } from "sonner";
import { cardApi } from "@/apis";
import { getUserFacingApiError } from "@/utils/api-error-message";
import {
  mapAttachmentDtoToCardAttachment,
  mapAttachmentDtosToCardAttachments,
} from "@/mappers/card.mapper";
import type { BoardDetail } from "@/types";

export interface UseCardAttachmentsOptions {
  selectedCardId: string | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
}

export function useCardAttachments({
  selectedCardId,
  setBoard,
}: UseCardAttachmentsOptions) {
  const [isAttachmentsLoading, setIsAttachmentsLoading] = React.useState<boolean>(false);
  const [attachmentsError, setAttachmentsError] = React.useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = React.useState<boolean>(false);
  const [pendingAttachmentId, setPendingAttachmentId] = React.useState<string | null>(null);

  // Active card ID whose attachments are currently loading (prevents race conditions)
  const activeAttachmentsCardIdRef = React.useRef<string | null>(null);

  const loadAttachmentsForCard = React.useCallback(async (cardId: string) => {
    activeAttachmentsCardIdRef.current = cardId;
    setIsAttachmentsLoading(true);
    setAttachmentsError(null);
    try {
      const attachments = await cardApi.getCardAttachments(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeAttachmentsCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        const mappedAttachments = mapAttachmentDtosToCardAttachments(attachments, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                attachments: mappedAttachments,
              };
            }),
          })),
        };
      });
      setAttachmentsError(null);
    } catch (err) {
      if (activeAttachmentsCardIdRef.current !== cardId) return;
      setAttachmentsError(getUserFacingApiError(err, "Failed to load attachments"));
    } finally {
      if (activeAttachmentsCardIdRef.current === cardId) {
        setIsAttachmentsLoading(false);
      }
    }
  }, [setBoard]);

  React.useEffect(() => {
    if (!selectedCardId) {
      activeAttachmentsCardIdRef.current = null;
      setIsAttachmentsLoading(false);
      setAttachmentsError(null);
      setIsUploadingAttachment(false);
      setPendingAttachmentId(null);
      return;
    }

    void loadAttachmentsForCard(selectedCardId);

    return () => {
      if (activeAttachmentsCardIdRef.current === selectedCardId) {
        activeAttachmentsCardIdRef.current = null;
      }
    };
  }, [selectedCardId, loadAttachmentsForCard]);

  const handleRetryAttachments = React.useCallback(() => {
    if (selectedCardId) {
      void loadAttachmentsForCard(selectedCardId);
    }
  }, [selectedCardId, loadAttachmentsForCard]);

  // Action: Upload Attachment
  const handleUploadAttachment = React.useCallback(async (cardId: string, file: File): Promise<void> => {
    setIsUploadingAttachment(true);
    try {
      const newDto = await cardApi.uploadCardAttachment(cardId, file);
      setBoard((prev) => {
        if (!prev) return prev;
        const newAttachment = mapAttachmentDtoToCardAttachment(newDto, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                attachments: c.attachments ? [...c.attachments, newAttachment] : [newAttachment],
              };
            }),
          })),
        };
      });
      toast.success("Attachment uploaded.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload attachment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "PAYLOAD_TOO_LARGE" || status === 413 || msg.includes("PAYLOAD_TOO_LARGE") || msg.includes("413")) {
        toast.error("File size exceeds 25MB limit.");
      } else if (code === "ATTACHMENT_TYPE_INVALID" || msg.includes("ATTACHMENT_TYPE_INVALID")) {
        toast.error("Invalid file format. Allowed formats: PDF, DOCX, TXT, PNG, JPG.");
      } else if (code === "ATTACHMENT_EMPTY" || msg.includes("ATTACHMENT_EMPTY")) {
        toast.error("Attachment file cannot be empty.");
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to upload attachments to this card.");
      } else if (code === "ARCHIVED" || msg.includes("ARCHIVED")) {
        toast.error("Cannot upload attachments to an archived card or board.");
      } else if (code === "FROZEN" || msg.includes("FROZEN")) {
        toast.error("Board is frozen. File upload disabled.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setIsUploadingAttachment(false);
    }
  }, [setBoard]);

  // Action: Delete Attachment
  const handleDeleteAttachment = React.useCallback(async (attachmentId: string): Promise<void> => {
    setPendingAttachmentId(attachmentId);
    try {
      await cardApi.deleteCardAttachment(attachmentId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (!c.attachments?.some((att) => att.id === attachmentId)) return c;
              return {
                ...c,
                attachments: c.attachments.filter((att) => att.id !== attachmentId),
              };
            }),
          })),
        };
      });
      toast.success("Attachment deleted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete attachment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to delete this attachment.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Attachment not found or already deleted.");
      } else if (code === "ARCHIVED" || msg.includes("ARCHIVED")) {
        toast.error("Cannot delete attachments from an archived card or board.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingAttachmentId(null);
    }
  }, [setBoard]);

  // Action: Download Attachment
  const handleDownloadAttachment = React.useCallback(async (attachmentId: string): Promise<Blob> => {
    try {
      return await cardApi.downloadCardAttachment(attachmentId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to download attachment";
      const status = (err as { status?: number })?.status;
      if (status === 403) {
        toast.error("You do not have permission to download this attachment.");
      } else if (status === 404) {
        toast.error("Attachment not found.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  }, []);

  return {
    isAttachmentsLoading,
    attachmentsError,
    isUploadingAttachment,
    pendingAttachmentId,
    handleRetryAttachments,
    handleUploadAttachment,
    handleDeleteAttachment,
    handleDownloadAttachment,
  };
}
