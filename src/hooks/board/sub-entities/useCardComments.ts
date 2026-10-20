import * as React from "react";
import { toast } from "sonner";
import { cardApi } from "@/apis";
import { getUserFacingApiError } from "@/utils/api-error-message";
import {
  mapCommentDtoToCardComment,
  mapCommentDtosToCardComments,
} from "@/mappers/card.mapper";
import type { BoardDetail } from "@/types";

export interface UseCardCommentsOptions {
  selectedCardId: string | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
}

export function useCardComments({
  selectedCardId,
  setBoard,
}: UseCardCommentsOptions) {
  const [isCommentsLoading, setIsCommentsLoading] = React.useState<boolean>(false);
  const [commentsError, setCommentsError] = React.useState<string | null>(null);

  // Active card ID whose comments are currently loaded/loading (prevents race conditions)
  const activeCommentsCardIdRef = React.useRef<string | null>(null);

  const loadCommentsForCard = React.useCallback(async (cardId: string) => {
    activeCommentsCardIdRef.current = cardId;
    setIsCommentsLoading(true);
    setCommentsError(null);
    try {
      const comments = await cardApi.getCardComments(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeCommentsCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        const mappedComments = mapCommentDtosToCardComments(comments, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                comments: mappedComments,
              };
            }),
          })),
        };
      });
      setCommentsError(null);
    } catch (err) {
      if (activeCommentsCardIdRef.current !== cardId) return;
      setCommentsError(getUserFacingApiError(err, "Failed to load comments"));
    } finally {
      if (activeCommentsCardIdRef.current === cardId) {
        setIsCommentsLoading(false);
      }
    }
  }, [setBoard]);

  React.useEffect(() => {
    if (!selectedCardId) {
      activeCommentsCardIdRef.current = null;
      setIsCommentsLoading(false);
      setCommentsError(null);
      return;
    }

    void loadCommentsForCard(selectedCardId);

    return () => {
      if (activeCommentsCardIdRef.current === selectedCardId) {
        activeCommentsCardIdRef.current = null;
      }
    };
  }, [selectedCardId, loadCommentsForCard]);

  const handleRetryComments = React.useCallback(() => {
    if (selectedCardId) {
      void loadCommentsForCard(selectedCardId);
    }
  }, [selectedCardId, loadCommentsForCard]);

  // Action: Add Comment
  const handleAddComment = React.useCallback(async (cardId: string, content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      const newDto = await cardApi.createCardComment(cardId, trimmed);
      setBoard((prev) => {
        if (!prev) return prev;
        const newComment = mapCommentDtoToCardComment(newDto, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              return {
                ...c,
                comments: c.comments ? [...c.comments, newComment] : [newComment],
              };
            }),
          })),
        };
      });
      toast.success("Comment added.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add comment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "COMMENT_INVALID" || msg.includes("COMMENT_INVALID")) {
        toast.error("Comment content must be between 1 and 10,000 characters.");
      } else if (code === "MENTION_INVALID" || msg.includes("MENTION_INVALID")) {
        toast.error("Mentioned user must be a member of this board.");
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to comment on this card.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  }, [setBoard]);

  // Action: Update Comment
  const handleUpdateComment = React.useCallback(async (commentId: string, content: string): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      const updatedDto = await cardApi.updateCardComment(commentId, trimmed);
      setBoard((prev) => {
        if (!prev) return prev;
        const updatedComment = mapCommentDtoToCardComment(updatedDto, prev.members);
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (!c.comments?.some((cmt) => cmt.id === commentId)) return c;
              return {
                ...c,
                comments: c.comments.map((cmt) => (cmt.id === commentId ? updatedComment : cmt)),
              };
            }),
          })),
        };
      });
      toast.success("Comment updated.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update comment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to edit this comment.");
      } else if (code === "COMMENT_INVALID" || msg.includes("COMMENT_INVALID")) {
        toast.error("Comment content must be between 1 and 10,000 characters.");
      } else if (code === "MENTION_INVALID" || msg.includes("MENTION_INVALID")) {
        toast.error("Mentioned user must be a member of this board.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Comment not found or already deleted.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  }, [setBoard]);

  // Action: Delete Comment
  const handleDeleteComment = React.useCallback(async (commentId: string): Promise<void> => {
    try {
      await cardApi.deleteCardComment(commentId);
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (!c.comments?.some((cmt) => cmt.id === commentId)) return c;
              return {
                ...c,
                comments: c.comments.map((cmt) => {
                  if (cmt.id !== commentId) return cmt;
                  return {
                    ...cmt,
                    content: null,
                    deletedAt: new Date().toISOString(),
                    isDeleted: true,
                  };
                }),
              };
            }),
          })),
        };
      });
      toast.success("Comment deleted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete comment";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;
      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to delete this comment.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Comment not found or already deleted.");
      } else {
        toast.error(msg);
      }
      throw err;
    }
  }, [setBoard]);

  return {
    isCommentsLoading,
    commentsError,
    handleRetryComments,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
  };
}
