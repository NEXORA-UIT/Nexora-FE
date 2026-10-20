import * as React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, RefreshCw } from "lucide-react";
import { BoardCalendar } from "@/components/kanban";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useWorkspaceCalendar } from "@/hooks";
import { getBoardDetailRoute } from "@/constants/routes";

export const WorkspaceCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { workspace, boards, lists, isLoading, error, partialFailureCount, reload } =
    useWorkspaceCalendar();
  const [selectedBoardId, setSelectedBoardId] = React.useState("ALL");
  const visibleLists =
    selectedBoardId === "ALL" ? lists : lists.filter((list) => list.boardId === selectedBoardId);
  const scheduledCardCount = lists.reduce(
    (count, list) => count + list.cards.filter((card) => card.startDate || card.dueDate).length,
    0
  );
  const unscheduledCardCount = lists.reduce(
    (count, list) => count + list.cards.filter((card) => !card.startDate && !card.dueDate).length,
    0
  );

  React.useEffect(() => {
    setSelectedBoardId("ALL");
  }, [workspace?.id]);

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Workspace calendar"
          description={`Planned cards in ${workspace?.name ?? "the selected workspace"}.`}
          eyebrow="Schedule & delivery"
        />
        <div className="flex w-full items-end gap-2 sm:w-auto">
          <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-neutral-700 sm:w-56 sm:flex-none">
            <span>Filter by Board</span>
            <select
              value={selectedBoardId}
              onChange={(event) => setSelectedBoardId(event.target.value)}
              disabled={isLoading}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm font-normal text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">All Boards</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name || board.title}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void reload()}
            disabled={isLoading}
            aria-label="Refresh calendar"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <section aria-label="Calendar summary" className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Boards included", value: boards.length, tone: "bg-blue-50 text-blue-700" },
          { label: "Scheduled cards", value: scheduledCardCount, tone: "bg-cyan-50 text-cyan-800" },
          { label: "Unscheduled cards", value: unscheduledCardCount, tone: "bg-amber-50 text-amber-800" },
        ].map(({ label, value, tone }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-semibold ${tone}`}>{value}</span>
            <p className="text-xs font-medium text-slate-600">{label}</p>
          </div>
        ))}
      </section>

      {partialFailureCount > 0 && (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Could not load the calendar for {partialFailureCount} Boards. Other Boards are still shown.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="border-error-200 text-error-700 rounded-lg border bg-error-50 px-4 py-3 text-sm"
        >
          {error}
        </p>
      )}
      {isLoading ? (
        <div
          role="status"
          className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm"
        >
          Loading calendar…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          <CalendarDays className="mx-auto mb-2 h-7 w-7 text-neutral-400" />
          Select a workspace or refresh to continue.
        </div>
      ) : (
        <BoardCalendar
          lists={visibleLists}
          onCardClick={(card) => navigate(getBoardDetailRoute(card.boardId))}
        />
      )}
    </main>
  );
};
