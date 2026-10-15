import * as React from "react";
import { toast } from "sonner";
import { cardApi } from "@/apis";
import { isCardBlocked } from "@/utils";
import type { BoardDetail } from "@/types";

export interface UseCardDependenciesOptions {
  selectedCardId: string | null;
  board?: BoardDetail | null;
  setBoard: React.Dispatch<React.SetStateAction<BoardDetail | null>>;
}

export function useCardDependencies({
  selectedCardId,
  setBoard,
}: UseCardDependenciesOptions) {
  const [isDependenciesLoading, setIsDependenciesLoading] = React.useState<boolean>(false);
  const [dependenciesError, setDependenciesError] = React.useState<string | null>(null);

  // Active card ID whose dependencies are currently loading (prevents race conditions)
  const activeDependenciesCardIdRef = React.useRef<string | null>(null);

  const loadDependenciesForCard = React.useCallback(async (cardId: string) => {
    activeDependenciesCardIdRef.current = cardId;
    setIsDependenciesLoading(true);
    setDependenciesError(null);
    try {
      const dependencies = await cardApi.getCardDependencies(cardId);

      // Guard against stale response if card selection changed while request was in-flight
      if (activeDependenciesCardIdRef.current !== cardId) return;

      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map((list) => ({
            ...list,
            cards: list.cards.map((c) => {
              if (c.id !== cardId) return c;
              const updatedCard = { ...c, dependencies };
              const { isBlocked, blockReason } = isCardBlocked(updatedCard, prev.lists);
              return {
                ...updatedCard,
                dependencies,
                isBlocked,
                blockReason,
              };
            }),
          })),
        };
      });
      setDependenciesError(null);
    } catch (err) {
      if (activeDependenciesCardIdRef.current !== cardId) return;
      setDependenciesError(err instanceof Error ? err.message : "Failed to load dependencies");
    } finally {
      if (activeDependenciesCardIdRef.current === cardId) {
        setIsDependenciesLoading(false);
      }
    }
  }, [setBoard]);

  React.useEffect(() => {
    if (!selectedCardId) {
      activeDependenciesCardIdRef.current = null;
      setIsDependenciesLoading(false);
      setDependenciesError(null);
      return;
    }

    void loadDependenciesForCard(selectedCardId);

    return () => {
      if (activeDependenciesCardIdRef.current === selectedCardId) {
        activeDependenciesCardIdRef.current = null;
      }
    };
  }, [selectedCardId, loadDependenciesForCard]);

  const handleRetryDependencies = React.useCallback(() => {
    if (selectedCardId) {
      void loadDependenciesForCard(selectedCardId);
    }
  }, [selectedCardId, loadDependenciesForCard]);

  // Action: Add Dependency
  const handleAddDependency = React.useCallback(async (cardId: string, prerequisiteCardId: string): Promise<void> => {
    try {
      const newDep = await cardApi.addDependency(cardId, { dependsOnCardId: prerequisiteCardId });
      setBoard((prev) => {
        if (!prev) return prev;
        const nextLists = prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => {
            if (c.id === cardId) {
              const updatedDeps = [...(c.dependencies || []), newDep];
              const updatedCard = { ...c, dependencies: updatedDeps };
              const { isBlocked, blockReason } = isCardBlocked(updatedCard, prev.lists);
              return { ...updatedCard, isBlocked, blockReason };
            }
            return c;
          }),
        }));
        return { ...prev, lists: nextLists };
      });
      toast.success("Dependency added");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add dependency";
      toast.error(msg);
      throw err;
    }
  }, [setBoard]);

  // Action: Delete Dependency
  const handleDeleteDependency = React.useCallback(async (cardId: string, dependencyId: string): Promise<void> => {
    try {
      await cardApi.deleteDependency(cardId, dependencyId);
      setBoard((prev) => {
        if (!prev) return prev;
        const nextLists = prev.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => {
            if (c.id === cardId) {
              const updatedDeps = (c.dependencies || []).filter((d) => d.id !== dependencyId);
              const updatedCard = { ...c, dependencies: updatedDeps };
              const { isBlocked, blockReason } = isCardBlocked(updatedCard, prev.lists);
              return { ...updatedCard, isBlocked, blockReason };
            }
            return c;
          }),
        }));
        return { ...prev, lists: nextLists };
      });
      toast.success("Dependency removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete dependency";
      toast.error(msg);
      throw err;
    }
  }, [setBoard]);

  return {
    isDependenciesLoading,
    dependenciesError,
    handleRetryDependencies,
    handleAddDependency,
    handleDeleteDependency,
  };
}
