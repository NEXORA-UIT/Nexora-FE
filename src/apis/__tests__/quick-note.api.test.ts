import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/apis/client";
import { quickNoteApi } from "@/apis/quick-note.api";

describe("quickNoteApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the documented Quick Note routes and payloads", async () => {
    const note = {
      id: "note-1",
      userId: "user-1",
      content: "Capture this idea",
      createdAt: "2026-10-16T00:00:00.000Z",
      updatedAt: "2026-10-16T00:00:00.000Z",
      convertedAt: null,
      convertedCardId: null,
    };
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: { success: true, data: [note] } });
    vi.spyOn(apiClient, "post")
      .mockResolvedValueOnce({ data: { success: true, data: note } })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            note,
            card: {
              id: "card-1",
              boardId: "board-1",
              listId: "list-1",
              cardKey: "NX-1",
              title: "Capture this idea",
            },
          },
        },
      });
    vi.spyOn(apiClient, "patch").mockResolvedValueOnce({
      data: { success: true, data: { ...note, content: "Updated" } },
    });
    vi.spyOn(apiClient, "delete").mockResolvedValueOnce({ data: { success: true, data: {} } });

    await expect(quickNoteApi.listQuickNotes()).resolves.toEqual([note]);
    await quickNoteApi.createQuickNote(note.content);
    await quickNoteApi.updateQuickNote(note.id, "Updated");
    await quickNoteApi.convertQuickNoteToCard(note.id, { boardId: "board-1", listId: "list-1" });
    await quickNoteApi.deleteQuickNote(note.id);

    expect(apiClient.get).toHaveBeenCalledWith("/quick-notes");
    expect(apiClient.post).toHaveBeenNthCalledWith(1, "/quick-notes", { content: note.content });
    expect(apiClient.patch).toHaveBeenCalledWith("/quick-notes/note-1", { content: "Updated" });
    expect(apiClient.post).toHaveBeenNthCalledWith(2, "/quick-notes/note-1/convert", {
      boardId: "board-1",
      listId: "list-1",
    });
    expect(apiClient.delete).toHaveBeenCalledWith("/quick-notes/note-1");
  });
});
