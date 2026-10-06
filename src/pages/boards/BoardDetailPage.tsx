import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, RefreshCw, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { useBoardDetail } from "@/hooks";
import {
  BoardDetailHeader,
  BoardDetailToolbar,
  KanbanBoard,
  KanbanColumnSkeleton,
} from "@/components/kanban";
import { Button } from "@/components/ui/button";

export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();

  const {
    board,
    filteredLists,
    isLoading,
    error,
    reload,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    handleAddCard,
    handleAddColumn,
    handleCommitMoveCard,
  } = useBoardDetail(boardId);

  const handleShareClick = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      toast.success("Board link copied to clipboard");
    } else {
      toast.success("Board link ready to share");
    }
  };

  const handleOptionsClick = () => {
    toast.info("Board settings menu opened");
  };

  const handleFilterClick = () => {
    toast.info("Filter panel toggled");
  };

  const handleArchivedListsClick = () => {
    toast.info(`${board?.archivedListsCount ?? 0} archived list(s) stored`);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. Loading State */}
      {isLoading && !board && (
        <div className="space-y-6">
          <div className="h-16 rounded-xl bg-neutral-100 animate-pulse" />
          <div className="h-10 rounded-xl bg-neutral-100 animate-pulse" />
          <KanbanColumnSkeleton count={3} />
        </div>
      )}

      {/* 2. Error State */}
      {error && !board && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center max-w-lg mx-auto my-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">Failed to Load Board</h2>
          <p className="mt-1 text-xs text-neutral-600 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void reload()}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to={ROUTES.BOARDS}>
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Boards</span>
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* 3. Board Loaded Successfully */}
      {board && (
        <>
          {/* Header */}
          <BoardDetailHeader
            board={board}
            onShareClick={handleShareClick}
            onOptionsClick={handleOptionsClick}
          />

          {/* Toolbar */}
          <BoardDetailToolbar
            activeView={activeView}
            onViewChange={setActiveView}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            archivedListsCount={board.archivedListsCount}
            onArchivedListsClick={handleArchivedListsClick}
            onFilterClick={handleFilterClick}
          />

          {/* Canvas Views */}
          {activeView === "calendar" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 p-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xs border border-neutral-200/80 text-primary-600 mb-3">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">Calendar View</h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm">
                Milestone and sprint timeline visualization is coming in the next release.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView("board")}
                className="mt-4"
              >
                Switch back to Kanban Board
              </Button>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <KanbanBoard
                lists={filteredLists}
                onCommitMoveCard={handleCommitMoveCard}
                onAddCard={handleAddCard}
                onAddColumn={handleAddColumn}
                onCardClick={(card) => {
                  toast.info(`Card ${card.code}: "${card.title}" selected`);
                }}
                onColumnOptionsClick={(list) => {
                  toast.info(`Column "${list.name}" options`);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
