import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { KanbanCard, KanbanList, MoveCardInput } from "@/types";
import { useKanbanDnd } from "../useKanbanDnd";

function makeCard(id: string, listId: string, position: number): KanbanCard {
  return {
    id,
    listId,
    boardId: "board-1",
    code: id.toUpperCase(),
    title: id,
    priority: "MEDIUM",
    position,
    status: "ACTIVE",
    statusGroup: "TODO",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    updatedAt: "2026-10-17T00:00:00.000Z",
    createdAt: "2026-10-16T00:00:00.000Z",
  };
}

function makeList(id: string, cards: KanbanCard[]): KanbanList {
  return {
    id,
    boardId: "board-1",
    name: id,
    category: "TODO",
    position: 1024,
    status: "ACTIVE",
    cards,
    createdAt: "2026-10-16T00:00:00.000Z",
    updatedAt: "2026-10-17T00:00:00.000Z",
  };
}

const activeEvent = (id: string) =>
  ({
    id,
    data: { current: undefined },
    rect: { current: { initial: null, translated: null } },
  }) as never;
const overEvent = (id: string) =>
  ({
    id,
    data: { current: undefined },
    rect: { top: 0, left: 0, width: 100, height: 50 },
  }) as never;

describe("useKanbanDnd", () => {
  it("previews reordering a card within the same list before committing", () => {
    const lists = [
      makeList("todo", [
        makeCard("card-a", "todo", 1024),
        makeCard("card-b", "todo", 2048),
        makeCard("card-c", "todo", 3072),
      ]),
    ];
    const onCommitMoveCard = vi.fn<(...args: [string, MoveCardInput]) => Promise<void>>();
    const { result } = renderHook(() => useKanbanDnd({ lists, onCommitMoveCard }));
    const active = { id: "card-a" };
    const over = { id: "card-c" };

    act(() => result.current.handleDragStart({ active: activeEvent(active.id) } as never));
    act(() =>
      result.current.handleDragOver({
        active: activeEvent(active.id),
        over: overEvent(over.id),
      } as never)
    );

    expect(result.current.previewLists[0]?.cards.map((card) => card.id)).toEqual([
      "card-b",
      "card-c",
      "card-a",
    ]);
  });

  it("commits a card dropped into an empty list at the first position", async () => {
    const lists = [makeList("todo", [makeCard("card-a", "todo", 1024)]), makeList("doing", [])];
    const onCommitMoveCard = vi.fn<(...args: [string, MoveCardInput]) => Promise<void>>();
    const { result } = renderHook(() => useKanbanDnd({ lists, onCommitMoveCard }));

    act(() => result.current.handleDragStart({ active: activeEvent("card-a") } as never));
    act(() =>
      result.current.handleDragOver({
        active: activeEvent("card-a"),
        over: overEvent("list-drop:doing"),
      } as never)
    );

    expect(result.current.previewLists[1]?.cards.map((card) => card.id)).toEqual(["card-a"]);

    await act(async () => {
      await result.current.handleDragEnd({
        active: activeEvent("card-a"),
        over: overEvent("list-drop:doing"),
      } as never);
    });

    expect(onCommitMoveCard).toHaveBeenCalledWith("card-a", {
      targetListId: "doing",
      position: 1024,
      updatedAt: "2026-10-17T00:00:00.000Z",
    });
  });
});
