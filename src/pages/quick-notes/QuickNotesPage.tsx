import * as React from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ArrowRight, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useQuickNotes } from "@/hooks";
import { getBoardDetailRoute } from "@/constants/routes";
import { getUserFacingApiError } from "@/utils/api-error-message";

export const QuickNotesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
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
  } = useQuickNotes();
  const [draft, setDraft] = React.useState("");
  const [selectedBoardId, setSelectedBoardId] = React.useState("");
  const [selectedListId, setSelectedListId] = React.useState("");
  const [editingContents, setEditingContents] = React.useState<Record<string, string>>({});
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setSavingId("new");
    try {
      await create(content);
      setDraft("");
      toast.success("Quick note saved.");
    } catch (cause) {
      toast.error(getUserFacingApiError(cause, "Could not save the note."));
    } finally {
      setSavingId(null);
    }
  };

  const handleBoardChange = async (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedListId("");
    try {
      if (boardId) await loadBoardLists(boardId);
    } catch (cause) {
      toast.error(getUserFacingApiError(cause, "Could not load the Board lists."));
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Quick notes"
        description="Capture personal ideas and turn them into Cards when you are ready."
        eyebrow="Personal workspace"
        actions={<Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void reload()}
          disabled={isLoading}
          aria-label="Refresh notes"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>}
      />

      <section className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{workspace?.name ?? "Personal notes"}</p><p className="mt-1 text-sm text-slate-600">Keep quick thoughts here, then convert a note into a Board Card when it is ready.</p></div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"><span className="text-lg text-blue-700">{notes.length}</span> {notes.length === 1 ? "note" : "notes"}</span>
      </section>

      <form
        onSubmit={(event) => void handleCreate(event)}
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label htmlFor="quick-note-draft" className="block text-xs font-semibold text-neutral-700">
          New note
        </label>
        <textarea
          id="quick-note-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={20000}
          rows={4}
          placeholder="Capture an idea, a reminder, or something you may turn into a Card…"
          className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!draft.trim() || savingId === "new"}>
            {savingId === "new" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Save note
          </Button>
        </div>
      </form>

      <section
        aria-label="Create a Card from a note"
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3"
      >
        <div className="sm:col-span-3">
          <h2 className="text-sm font-semibold text-neutral-900">Create a Card in</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {workspace
              ? `Workspace: ${workspace.name}`
              : "Select a workspace in the sidebar before converting a note."}
          </p>
        </div>
        <label className="space-y-1 text-xs font-medium text-neutral-700">
          <span>Board</span>
          <select
            value={selectedBoardId}
            onChange={(event) => void handleBoardChange(event.target.value)}
            disabled={!workspace || boards.length === 0}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm font-normal"
          >
            <option value="">Select a Board</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-neutral-700 sm:col-span-2">
          <span>List</span>
          <select
            value={selectedListId}
            onChange={(event) => setSelectedListId(event.target.value)}
            disabled={!selectedBoardId || lists.length === 0}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm font-normal"
          >
            <option value="">Select a List</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {isLoading ? (
        <p
          role="status"
          className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500"
        >
          Loading notes…
        </p>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void reload()}>Try again</Button>
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-800">You do not have any notes yet.</p>
          <p className="mt-1 text-xs">Start with a thought or reminder in the editor above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const content = editingContents[note.id] ?? note.content;
            const isConverted = Boolean(note.convertedAt || note.convertedCardId);
            return (
              <article
                key={note.id}
                className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
                  <span>Updated {format(parseISO(note.updatedAt), "MMM d, yyyy h:mm a")}</span>
                  {isConverted && note.convertedCardId && (
                    <span className="text-success-700 rounded-full bg-success-50 px-2.5 py-1 font-medium">
                      Converted to Card
                    </span>
                  )}
                </div>
                <textarea
                  aria-label="Note content"
                  value={content}
                  onChange={(event) =>
                    setEditingContents((current) => ({ ...current, [note.id]: event.target.value }))
                  }
                  maxLength={20000}
                  rows={Math.min(8, Math.max(3, content.split("\n").length + 1))}
                  disabled={isConverted || savingId === note.id}
                  className="w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-6 text-neutral-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-70"
                />
                <div className="flex flex-wrap justify-end gap-2">
                  {!isConverted && content.trim() !== note.content && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={savingId === note.id || !content.trim()}
                      onClick={async () => {
                        setSavingId(note.id);
                        try {
                          await update(note.id, content.trim());
                          setEditingContents((current) => {
                            const next = { ...current };
                            delete next[note.id];
                            return next;
                          });
                          toast.success("Note updated.");
                        } catch (cause) {
                          toast.error(
                            getUserFacingApiError(cause, "Could not update the note.")
                          );
                        } finally {
                          setSavingId(null);
                        }
                      }}
                    >
                      Save changes
                    </Button>
                  )}
                  {!isConverted && selectedBoardId && selectedListId && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={savingId === note.id}
                      onClick={async () => {
                        setSavingId(note.id);
                        try {
                          const result = await convert(note.id, selectedBoardId, selectedListId);
                          toast.success("Note converted to a Card.");
                          navigate(getBoardDetailRoute(result.card.boardId));
                        } catch (cause) {
                          toast.error(
                            getUserFacingApiError(cause, "Could not convert the note.")
                          );
                        } finally {
                          setSavingId(null);
                        }
                      }}
                    >
                      Convert to Card <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!isConverted && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={savingId === note.id}
                      aria-label="Delete note"
                      onClick={async () => {
                        if (!window.confirm("Delete this note?")) return;
                        setSavingId(note.id);
                        try {
                          await remove(note.id);
                          toast.success("Note deleted.");
                        } catch (cause) {
                          toast.error(
                            getUserFacingApiError(cause, "Could not delete the note.")
                          );
                        } finally {
                          setSavingId(null);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};
