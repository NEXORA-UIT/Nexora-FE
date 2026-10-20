import * as React from "react";
import { DndContext, useDndContext } from "@dnd-kit/core";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { KanbanList } from "@/types";
import { KanbanColumn } from "../KanbanColumn";

function DroppableRegistryProbe({
  id,
  onRegistration,
}: {
  id: string;
  onRegistration: (registered: boolean) => void;
}) {
  const { droppableContainers } = useDndContext();

  React.useEffect(() => {
    onRegistration(Boolean(droppableContainers.get(id)));
  }, [droppableContainers, id, onRegistration]);

  return null;
}

const emptyList: KanbanList = {
  id: "empty-list",
  boardId: "board-1",
  name: "Empty",
  category: "TODO",
  position: 1024,
  status: "ACTIVE",
  cards: [],
  createdAt: "2026-10-16T00:00:00.000Z",
  updatedAt: "2026-10-17T00:00:00.000Z",
};

describe("KanbanColumn drag-and-drop target", () => {
  it("registers an empty column body as a droppable target", async () => {
    const onRegistration = vi.fn();

    render(
      <DndContext>
        <KanbanColumn
          list={emptyList}
          isAddingCard={false}
          onSetAddingCard={() => undefined}
          onAddCard={() => undefined}
        >
          <></>
        </KanbanColumn>
        <DroppableRegistryProbe id="list-drop:empty-list" onRegistration={onRegistration} />
      </DndContext>
    );

    await waitFor(() => expect(onRegistration).toHaveBeenLastCalledWith(true));
  });
});
