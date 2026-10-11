import * as React from "react";
import { toast } from "sonner";
import { cardApi } from "@/apis";
import { applyAuthoritativeCardUpdate, updateCardInBoard } from "../utils/cardReconciler";
import type { BoardDetail } from "@/types";

export interface UseCardLabelsOptions {
  selectedCardId: string | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
}

export function useCardLabels({
  selectedCardId,
  setBoard,
}: UseCardLabelsOptions) {
  const [isLabelsLoading, setIsLabelsLoading] = React.useState<boolean>(false);
  const [labelsError, setLabelsError] = React.useState<string | null>(null);
  const [pendingLabelId, setPendingLabelId] = React.useState<string | null>(null);

  // Active card ID whose labels are currently loaded/loading (prevents race conditions)
  const activeLabelsCardIdRef = React.useRef<string | null>(null);

  const loadLabelsForCard = React.useCallback(async (cardId: string) => {
    activeLabelsCardIdRef.current = cardId;
    setIsLabelsLoading(true);
    setLabelsError(null);
    try {
      const labels = await cardApi.getCardLabels(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeLabelsCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) => ({
          ...c,
          labels,
        }));
      });
      setLabelsError(null);
    } catch (err) {
      if (activeLabelsCardIdRef.current !== cardId) return;
      setLabelsError(err instanceof Error ? err.message : "Failed to load card labels");
    } finally {
      if (activeLabelsCardIdRef.current === cardId) {
        setIsLabelsLoading(false);
      }
    }
  }, [setBoard]);

  React.useEffect(() => {
    if (!selectedCardId) {
      activeLabelsCardIdRef.current = null;
      setIsLabelsLoading(false);
      setLabelsError(null);
      setPendingLabelId(null);
      return;
    }

    void loadLabelsForCard(selectedCardId);

    return () => {
      if (activeLabelsCardIdRef.current === selectedCardId) {
        activeLabelsCardIdRef.current = null;
      }
    };
  }, [selectedCardId, loadLabelsForCard]);

  const handleRetryLabels = React.useCallback(async () => {
    if (!selectedCardId) return;
    await loadLabelsForCard(selectedCardId);
    try {
      const refreshedCard = await cardApi.getCardById(selectedCardId);
      if (activeLabelsCardIdRef.current !== selectedCardId) return;
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, selectedCardId, (c) =>
          applyAuthoritativeCardUpdate(c, refreshedCard)
        );
      });
      setLabelsError(null);
    } catch {
      if (activeLabelsCardIdRef.current !== selectedCardId) return;
      setLabelsError("Unable to sync latest card timestamp with server.");
    }
  }, [selectedCardId, loadLabelsForCard, setBoard]);

  const reconcileCardTimestamp = React.useCallback(async (cardId: string) => {
    try {
      const refreshedCard = await cardApi.getCardById(cardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) =>
          applyAuthoritativeCardUpdate(c, refreshedCard)
        );
      });
      setLabelsError(null);
    } catch {
      setLabelsError("Unable to sync latest card timestamp. Click Retry to sync.");
      toast.warning("Label updated, but unable to sync latest card timestamp. Click Retry to sync.");
    }
  }, [setBoard]);

  // Action: Attach Label to Card
  const handleAttachCardLabel = React.useCallback(async (cardId: string, labelId: string) => {
    if (pendingLabelId === labelId) return;
    setPendingLabelId(labelId);
    try {
      const attachedLabel = await cardApi.attachCardLabel(cardId, labelId);

      // Only on verified success, update local state
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) => {
          const alreadyAttached = c.labels.some((l) => l.id === labelId);
          if (alreadyAttached) return c;
          return {
            ...c,
            labels: [...c.labels, attachedLabel],
          };
        });
      });

      toast.success("Label attached.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to attach label";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "CARD_LABEL_EXISTS" || status === 409 || msg.includes("CARD_LABEL_EXISTS") || msg.includes("409")) {
        toast.info("This label is already attached to this card.");
        void loadLabelsForCard(cardId);
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission, or this card is archived.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or label not found, or label belongs to another board.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingLabelId(null);
    }
  }, [loadLabelsForCard, pendingLabelId, reconcileCardTimestamp, setBoard]);

  // Action: Detach Label from Card
  const handleDetachCardLabel = React.useCallback(async (cardId: string, labelId: string) => {
    if (pendingLabelId === labelId) return;
    setPendingLabelId(labelId);
    try {
      await cardApi.detachCardLabel(cardId, labelId);

      // Only on verified success, update local state
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) => ({
          ...c,
          labels: c.labels.filter((l) => l.id !== labelId),
        }));
      });

      toast.success("Label detached.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to detach label";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to detach this label.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or label attachment not found.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingLabelId(null);
    }
  }, [pendingLabelId, reconcileCardTimestamp, setBoard]);

  return {
    isLabelsLoading,
    labelsError,
    pendingLabelId,
    handleRetryLabels,
    handleAttachCardLabel,
    handleDetachCardLabel,
  };
}
