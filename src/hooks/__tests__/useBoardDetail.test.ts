import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBoardDetail } from "../useBoardDetail";

describe("useBoardDetail Card Detail State Orchestration", () => {
  it("selects a card and derives selectedCard", async () => {
    const { result } = renderHook(() => useBoardDetail("board-website-redesign"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const card101 = result.current.board?.lists[0].cards.find((c) => c.id === "card-101");
    expect(card101).toBeDefined();

    act(() => {
      result.current.handleSelectCard(card101!);
    });

    expect(result.current.selectedCardId).toBe("card-101");
    expect(result.current.selectedCard?.title).toBe(card101?.title);

    act(() => {
      result.current.handleCloseCardDetail();
    });

    expect(result.current.selectedCardId).toBeNull();
    expect(result.current.selectedCard).toBeNull();
  });

  it("handles status change using moveCard and enforces prerequisite check for DONE", async () => {
    const { result } = renderHook(() => useBoardDetail("board-website-redesign"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // card-103 is blocked
    const card103 = result.current.board?.lists[0].cards.find((c) => c.id === "card-103");
    expect(card103?.isBlocked).toBe(true);

    let moved = false;
    await act(async () => {
      moved = await result.current.handleStatusChange(card103!, "DONE");
    });

    // Moving blocked card to DONE must be rejected!
    expect(moved).toBe(false);

    // card-101 is NOT blocked, moving to IN_PROGRESS should succeed
    const card101 = result.current.board?.lists[0].cards.find((c) => c.id === "card-101");
    await act(async () => {
      moved = await result.current.handleStatusChange(card101!, "IN_PROGRESS");
    });

    expect(moved).toBe(true);
  });

  it("enforces blocked card rejection in drag-and-drop handleCommitMoveCard", async () => {
    const { result } = renderHook(() => useBoardDetail("board-website-redesign"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // card-103 is blocked
    const card103 = result.current.board?.lists[0].cards.find((c) => c.id === "card-103");
    expect(card103?.isBlocked).toBe(true);

    const doneList = result.current.board!.lists.find((l) => l.category === "DONE");
    expect(doneList).toBeDefined();
    if (!doneList) return;

    // Attempt drag-and-drop move of blocked card into DONE column
    await act(async () => {
      await result.current.handleCommitMoveCard("card-103", {
        targetListId: doneList.id,
        position: 1024,
        updatedAt: card103!.updatedAt,
      });
    });

    // Verify card-103 was NOT moved to doneList
    const doneCards = result.current.board?.lists.find((l) => l.id === doneList.id)?.cards || [];
    expect(doneCards.some((c) => c.id === "card-103")).toBe(false);

    // Verify card-103 is still in original list
    const originalListCards = result.current.board?.lists.find((l) => l.id === card103!.listId)?.cards || [];
    expect(originalListCards.some((c) => c.id === "card-103")).toBe(true);
  });
});
