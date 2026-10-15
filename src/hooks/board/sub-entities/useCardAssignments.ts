import * as React from "react";
import { toast } from "sonner";
import { cardApi } from "@/apis";
import { mapCardAssignmentDtosToBoardMembers } from "@/mappers/card.mapper";
import { applyAuthoritativeCardUpdate, updateCardInBoard } from "../utils/cardReconciler";
import type { BoardDetail, BoardMember } from "@/types";

export interface UseCardAssignmentsOptions {
  selectedCardId: string | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
}

export function useCardAssignments({
  selectedCardId,
  setBoard,
}: UseCardAssignmentsOptions) {
  const [isAssignmentsLoading, setIsAssignmentsLoading] = React.useState<boolean>(false);
  const [assignmentsError, setAssignmentsError] = React.useState<string | null>(null);
  const [pendingMemberUserId, setPendingMemberUserId] = React.useState<string | null>(null);

  // Active card ID whose assignments are currently loaded/loading (prevents race conditions)
  const activeAssignmentsCardIdRef = React.useRef<string | null>(null);

  const loadAssignmentsForCard = React.useCallback(async (cardId: string) => {
    activeAssignmentsCardIdRef.current = cardId;
    setIsAssignmentsLoading(true);
    setAssignmentsError(null);
    try {
      const assignments = await cardApi.getCardAssignments(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeAssignmentsCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        const mappedAssignees = mapCardAssignmentDtosToBoardMembers(assignments, prev.members);
        return updateCardInBoard(prev, cardId, (c) => ({
          ...c,
          assignees: mappedAssignees,
        }));
      });
      setAssignmentsError(null);
    } catch (err) {
      if (activeAssignmentsCardIdRef.current !== cardId) return;
      setAssignmentsError(err instanceof Error ? err.message : "Failed to load card assignments");
    } finally {
      if (activeAssignmentsCardIdRef.current === cardId) {
        setIsAssignmentsLoading(false);
      }
    }
  }, [setBoard]);

  React.useEffect(() => {
    if (!selectedCardId) {
      activeAssignmentsCardIdRef.current = null;
      setIsAssignmentsLoading(false);
      setAssignmentsError(null);
      setPendingMemberUserId(null);
      return;
    }

    void loadAssignmentsForCard(selectedCardId);

    return () => {
      if (activeAssignmentsCardIdRef.current === selectedCardId) {
        activeAssignmentsCardIdRef.current = null;
      }
    };
  }, [selectedCardId, loadAssignmentsForCard]);

  const handleRetryAssignments = React.useCallback(async () => {
    if (!selectedCardId) return;
    await loadAssignmentsForCard(selectedCardId);
    try {
      const refreshedCard = await cardApi.getCardById(selectedCardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, selectedCardId, (c) =>
          applyAuthoritativeCardUpdate(c, refreshedCard)
        );
      });
      setAssignmentsError(null);
    } catch {
      setAssignmentsError("Unable to sync latest card timestamp with server.");
    }
  }, [selectedCardId, loadAssignmentsForCard, setBoard]);

  const reconcileCardTimestamp = React.useCallback(async (cardId: string) => {
    try {
      const refreshedCard = await cardApi.getCardById(cardId);
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) =>
          applyAuthoritativeCardUpdate(c, refreshedCard)
        );
      });
      setAssignmentsError(null);
    } catch {
      setAssignmentsError("Unable to sync latest card timestamp. Click Retry to sync.");
      toast.warning("Member updated, but unable to sync latest card timestamp. Click Retry to sync.");
    }
  }, [setBoard]);

  // Action: Assign Member to Card
  const handleAssignMember = React.useCallback(async (cardId: string, userId: string) => {
    if (pendingMemberUserId === userId) return;
    setPendingMemberUserId(userId);
    try {
      await cardApi.assignCardMember(cardId, userId);

      // Only on verified success, update local state
      setBoard((prev) => {
        if (!prev) return prev;
        const targetMember: BoardMember = prev.members.find((m) => m.id === userId) || {
          id: userId,
          name: "Member",
          initials: "M",
          role: "MEMBER" as const,
        };

        return updateCardInBoard(prev, cardId, (c) => {
          const alreadyAssigned = c.assignees.some((a) => a.id === userId);
          if (alreadyAssigned) return c;
          return {
            ...c,
            assignees: [...c.assignees, targetMember],
          };
        });
      });

      toast.success("Member assigned.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign member";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "ASSIGNMENT_EXISTS" || status === 409 || msg.includes("ASSIGNMENT_EXISTS") || msg.includes("409")) {
        toast.info("This member is already assigned to this card.");
      } else if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission, or this member is not eligible.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or member not found, or assignment data has changed.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingMemberUserId(null);
    }
  }, [pendingMemberUserId, reconcileCardTimestamp, setBoard]);

  // Action: Unassign Member from Card
  const handleUnassignMember = React.useCallback(async (cardId: string, userId: string) => {
    if (pendingMemberUserId === userId) return;
    setPendingMemberUserId(userId);
    try {
      await cardApi.unassignCardMember(cardId, userId);

      // Only on verified success, update local state
      setBoard((prev) => {
        if (!prev) return prev;
        return updateCardInBoard(prev, cardId, (c) => ({
          ...c,
          assignees: c.assignees.filter((a) => a.id !== userId),
        }));
      });

      toast.success("Member unassigned.");

      // Reconcile parent Card timestamp
      await reconcileCardTimestamp(cardId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to unassign member";
      const code = (err as { code?: string })?.code;
      const status = (err as { status?: number })?.status;

      if (code === "FORBIDDEN" || status === 403 || msg.includes("FORBIDDEN") || msg.includes("403")) {
        toast.error("You do not have permission to unassign this member.");
      } else if (code === "NOT_FOUND" || status === 404 || msg.includes("NOT_FOUND") || msg.includes("404")) {
        toast.error("Card or assignment not found.");
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setPendingMemberUserId(null);
    }
  }, [pendingMemberUserId, reconcileCardTimestamp, setBoard]);

  return {
    isAssignmentsLoading,
    assignmentsError,
    pendingMemberUserId,
    handleRetryAssignments,
    handleAssignMember,
    handleUnassignMember,
  };
}
