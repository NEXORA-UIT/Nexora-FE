import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FolderArchive } from "lucide-react";
import { WorkspaceHeader, WorkspaceTabs } from "@/components/workspace";
import {
  BoardToolbar,
  BoardCard,
  BoardCardSkeleton,
  ArchivedBoardCard,
  BoardEmptyState,
  CreateBoardModal,
  ConfirmDeleteBoardDialog,
} from "@/components/boards";
import { useWorkspaceBoards } from "@/hooks";
import { getBoardDetailRoute } from "@/constants/routes";
import type { WorkspaceTabId } from "@/types";

export const BoardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<WorkspaceTabId>("boards");

  const {
    workspace,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filterTab,
    setFilterTab,
    sortBy,
    setSortBy,
    filteredActiveBoards,
    filteredArchivedBoards,
    counts,
    isCreateOpen,
    setIsCreateOpen,
    isSubmitting,
    deleteTargetBoard,
    setDeleteTargetBoard,
    isDeleting,
    handleCreateBoard,
    handleArchiveBoard,
    handleRestoreBoard,
    handleDeleteBoard,
    handleConfirmDelete,
  } = useWorkspaceBoards("ws-core-platform");

  // Loading State
  if (isLoading && !workspace) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full animate-pulse rounded-2xl border border-neutral-200/90 bg-white p-6" />
        <BoardCardSkeleton />
      </div>
    );
  }

  // Error State
  if (error && !workspace) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-center text-xs text-error-700">
        <p className="font-semibold">Unable to load workspace</p>
        <p className="mt-1 text-neutral-600">{error}</p>
      </div>
    );
  }

  if (!workspace) return null;

  const showActiveSection =
    filterTab === "all" || filterTab === "active";
  const showArchivedSection =
    filterTab === "all" || filterTab === "archived";

  const hasNoResults =
    (filterTab === "all" &&
      filteredActiveBoards.length === 0 &&
      filteredArchivedBoards.length === 0) ||
    (filterTab === "active" && filteredActiveBoards.length === 0) ||
    (filterTab === "archived" && filteredArchivedBoards.length === 0);

  return (
    <div className="space-y-6">
      {/* 1. Workspace Header */}
      <WorkspaceHeader
        workspace={workspace}
        onCreateBoardClick={() => setIsCreateOpen(true)}
      />

      {/* 2. Workspace Navigation Tabs */}
      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        boardCount={workspace.activeBoardCount}
        memberCount={workspace.memberCount}
      />

      {/* 3. Tab Content Area */}
      {activeTab === "boards" ? (
        <div className="space-y-6 pt-2">
          {/* Section Heading & Subtitle */}
          <div>
            <h2 className="text-base font-bold text-neutral-900">Boards</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Projects in this workspace
            </p>
          </div>

          {/* Search, Filter & Sort Toolbar */}
          <BoardToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={filterTab}
            onFilterChange={setFilterTab}
            sortBy={sortBy}
            onSortChange={setSortBy}
            counts={counts}
          />

          {/* Empty State when no boards match filter/search */}
          {hasNoResults ? (
            <BoardEmptyState
              searchQuery={searchQuery}
              onClearFilters={() => {
                setSearchQuery("");
                setFilterTab("all");
              }}
            />
          ) : (
            <div className="space-y-8">
              {/* Active Boards Section */}
              {showActiveSection && filteredActiveBoards.length > 0 && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 select-none">
                    <h3 className="text-xs font-semibold text-neutral-900">
                      Active Boards
                    </h3>
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary-100/70 px-1.5 text-[10px] font-semibold text-primary-700">
                      {filteredActiveBoards.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {filteredActiveBoards.map((board) => (
                      <BoardCard
                        key={board.id}
                        board={board}
                        onArchive={handleArchiveBoard}
                        onDelete={handleDeleteBoard}
                        onClick={(b) => navigate(getBoardDetailRoute(b.id))}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Archived Boards Section */}
              {showArchivedSection && filteredArchivedBoards.length > 0 && (
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center gap-2 select-none">
                    <FolderArchive className="h-4 w-4 text-neutral-500" />
                    <h3 className="text-xs font-semibold text-neutral-700">
                      Archived Boards
                    </h3>
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-[10px] font-semibold text-neutral-600">
                      {filteredArchivedBoards.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                    {filteredArchivedBoards.map((board) => (
                      <ArchivedBoardCard
                        key={board.id}
                        board={board}
                        onRestore={handleRestoreBoard}
                        onDelete={handleDeleteBoard}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Placeholder for other workspace tabs (Overview, Members, Settings) */
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-12 text-center select-none">
          <p className="text-sm font-semibold text-neutral-800 capitalize">
            {activeTab} Tab
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            This section is currently under development. Please check back soon.
          </p>
        </div>
      )}

      {/* 4. Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateBoard}
        workspaceId={workspace.id}
        isSubmitting={isSubmitting}
      />

      {/* 5. Safe Delete Confirmation Dialog */}
      <ConfirmDeleteBoardDialog
        board={deleteTargetBoard}
        isOpen={Boolean(deleteTargetBoard)}
        onClose={() => setDeleteTargetBoard(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
