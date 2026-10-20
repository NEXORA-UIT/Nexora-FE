import * as React from "react";
import { ArrowRight, LayoutGrid, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import {
  HomeGreeting,
  MyWorkSection,
  UpcomingSection,
  ContinueWorkingSection,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { useMyTasks, useWorkspaceBoards } from "@/hooks";
import { ROUTES } from "@/constants/routes";

export const HomePage: React.FC = () => {
  const taskState = useMyTasks();
  const boardState = useWorkspaceBoards();
  const openTaskCount = taskState.tasks.filter((task) => task.statusGroup !== "DONE").length;

  if (boardState.isLoading && !boardState.workspace) {
    return <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading your workspace…</div>;
  }

  if (boardState.error && !boardState.workspace) {
    return (
      <section role="alert" className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Unable to load your workspace</p>
        <p className="mt-2 text-sm text-slate-600">{boardState.error}</p>
        <Button type="button" variant="outline" className="mt-4 gap-2" onClick={() => void boardState.reload()}>
          <RotateCw aria-hidden="true" className="h-4 w-4" /> Try again
        </Button>
      </section>
    );
  }

  if (!boardState.workspace) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><LayoutGrid aria-hidden="true" className="h-7 w-7" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">No workspace selected</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Create or join a workspace to see your boards and assigned work here.</p>
        <Link to={ROUTES.BOARDS} className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
          Open Boards <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <HomeGreeting
        workspace={boardState.workspace}
        boardCount={boardState.boards.length}
        openTaskCount={openTaskCount}
        isTaskLoading={taskState.isLoading}
        taskError={taskState.error}
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <MyWorkSection {...taskState} />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <UpcomingSection tasks={taskState.tasks} isLoading={taskState.isLoading} error={taskState.error} />
          {boardState.error && (
            <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Some boards could not be loaded. <button type="button" className="font-semibold underline" onClick={() => void boardState.reload()}>Retry</button>
            </div>
          )}
        </div>
      </div>
      <ContinueWorkingSection boards={boardState.boards} workspaceName={boardState.workspace.name} />
    </div>
  );
};
