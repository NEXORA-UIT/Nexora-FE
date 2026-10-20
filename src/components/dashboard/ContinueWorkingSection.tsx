import * as React from "react";
import { ArrowRight, Kanban, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { getBoardDetailRoute, ROUTES } from "@/constants/routes";
import type { Board } from "@/types";

interface ContinueWorkingSectionProps {
  boards: Board[];
  workspaceName: string;
}

export const ContinueWorkingSection: React.FC<ContinueWorkingSectionProps> = ({ boards, workspaceName }) => {
  const recentBoards = [...boards]
    .filter((board) => board.status === "active")
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 3);

  return (
    <section aria-labelledby="continue-working-heading" className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">Project spaces</p><h2 id="continue-working-heading" className="mt-1 text-lg font-semibold text-slate-900">Continue working</h2><p className="mt-1 text-sm text-slate-500">Active boards in {workspaceName}</p></div>
        <Link to={ROUTES.BOARDS} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800">View all boards <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
      </div>
      {recentBoards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-9 text-center">
          <LayoutGrid aria-hidden="true" className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-900">No active boards in this workspace</p>
          <Link to={ROUTES.BOARDS} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">Open Boards <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentBoards.map((board) => (
            <Link key={board.id} to={getBoardDetailRoute(board.id)} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700"><Kanban aria-hidden="true" className="h-5 w-5" /></span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Active</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-900 group-hover:text-blue-700">{board.title}</p>
              {board.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{board.description}</p>}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>{board.openTasksCount === undefined ? "Board" : `${board.openTasksCount} open tasks`}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700">Open <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
