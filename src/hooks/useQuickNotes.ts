import * as React from "react";
import { boardApi } from "@/apis/board.api";
import { listApi } from "@/apis/list.api";
import { quickNoteApi } from "@/apis/quick-note.api";
import { useWorkspaceStore } from "@/stores/workspace.store";
import type { KanbanList, QuickNoteDto } from "@/types";
import { getUserFacingApiError } from "@/utils/api-error-message";

export function useQuickNotes() {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const workspace = workspaces.find((candidate) => candidate.id === activeWorkspaceId) ?? null;
  const [notes, setNotes] = React.useState<QuickNoteDto[]>([]);
  const [boards, setBoards] = React.useState<Array<{ id: string; name: string }>>([]);
  const [lists, setLists] = React.useState<KanbanList[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quickNotes, workspaceBoards] = await Promise.all([
        quickNoteApi.listQuickNotes(),
        workspace ? boardApi.getBoards(workspace.id) : Promise.resolve([]),
      ]);
      setNotes(quickNotes);
      setBoards(
        workspaceBoards.map((board) => ({ id: board.id, name: board.name || board.title }))
      );
      setLists([]);
    } catch (cause) {
      setError(getUserFacingApiError(cause, "Could not load Quick Notes."));
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const loadBoardLists = React.useCallback(async (boardId: string) => {
    try {
      setLists((await listApi.getBoardLists(boardId)).filter((list) => list.status === "ACTIVE"));
    } catch (cause) {
      setLists([]);
      throw cause;
    }
  }, []);

  const create = React.useCallback(async (content: string) => {
    const note = await quickNoteApi.createQuickNote(content);
    setNotes((current) => [note, ...current]);
    return note;
  }, []);

  const update = React.useCallback(async (id: string, content: string) => {
    const note = await quickNoteApi.updateQuickNote(id, content);
    setNotes((current) => current.map((item) => (item.id === id ? note : item)));
    return note;
  }, []);

  const remove = React.useCallback(async (id: string) => {
    await quickNoteApi.deleteQuickNote(id);
    setNotes((current) => current.filter((item) => item.id !== id));
  }, []);

  const convert = React.useCallback(async (id: string, boardId: string, listId: string) => {
    const result = await quickNoteApi.convertQuickNoteToCard(id, { boardId, listId });
    setNotes((current) => current.map((item) => (item.id === id ? result.note : item)));
    return result;
  }, []);

  return {
    workspace,
    notes,
    boards,
    lists,
    isLoading,
    error,
    reload,
    loadBoardLists,
    create,
    update,
    remove,
    convert,
  };
}
