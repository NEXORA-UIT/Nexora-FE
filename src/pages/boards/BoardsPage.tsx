import * as React from "react";
import { useNavigate } from "react-router-dom";
import { FolderArchive, FolderPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  WorkspaceHeader,
  WorkspaceTabs,
  CreateWorkspaceModal,
  WorkspaceMembersPanel,
} from "@/components/workspace";
import { WorkspaceOverviewPanel } from "@/components/workspace/WorkspaceOverviewPanel";
import { WorkspaceSettingsPanel } from "@/components/workspace/WorkspaceSettingsPanel";
import {
  BoardToolbar,
  BoardCard,
  BoardCardSkeleton,
  ArchivedBoardCard,
  BoardEmptyState,
  CreateBoardModal,
  ConfirmDeleteBoardDialog,
} from "@/components/boards";
import { Button } from "@/components/ui/button";
import { useWorkspaceBoards } from "@/hooks";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { ApiError } from "@/apis/client";
import { getBoardDetailRoute } from "@/constants/routes";
import { getUserFacingApiError } from "@/utils/api-error-message";
import type { WorkspaceTabId } from "@/types";

export const BoardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<WorkspaceTabId>("boards");
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = React.useState(false);

  const {
    isInitialized,
    isLoading: isStoreLoading,
    fetchWorkspaces,
    archiveWorkspace,
    unarchiveWorkspace,
  } = useWorkspaceStore();

  React.useEffect(() => {
    if (!isInitialized) {
      void fetchWorkspaces();
    }
  }, [isInitialized, fetchWorkspaces]);

  const {
    workspace,
    boards,
    isLoading: isBoardsLoading,
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
  } = useWorkspaceBoards();

  const isLoading = isBoardsLoading || isStoreLoading;

  // Local derived board count for UI presentation
  const localActiveBoardCount = React.useMemo(
    () => boards.filter((b) => b.status === "active").length,
    [boards]
  );

  // Actions for workspace lifecycle
  const handleArchiveWorkspace = async () => {
    if (!workspace) return;
    try {
      await archiveWorkspace(workspace.id);
      toast.success(`Workspace "${workspace.name}" archived.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        if (err.code === "WORKSPACE_FROZEN") {
          toast.error("This workspace is frozen and cannot be modified.");
        } else {
          toast.error("Only the workspace owner can archive this workspace.");
        }
      } else {
        toast.error(
          getUserFacingApiError(err, "Failed to archive workspace.")
        );
      }
    }
  };

  const handleRestoreWorkspace = async () => {
    if (!workspace) return;
    try {
      await unarchiveWorkspace(workspace.id);
      toast.success(`Workspace "${workspace.name}" restored to Active.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        if (err.code === "WORKSPACE_FROZEN") {
          toast.error("This workspace is frozen and cannot be modified.");
        } else {
          toast.error("Only the workspace owner can restore this workspace.");
        }
      } else {
        toast.error(
          getUserFacingApiError(err, "Failed to restore workspace.")
        );
      }
    }
  };

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

  // Empty State: User has no workspaces
  if (!workspace) {
    return (
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-12 text-center select-none space-y-4 max-w-lg mx-auto mt-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <FolderPlus className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-neutral-900">
            No Workspace Selected
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You do not have any workspaces yet or none is currently active. Create your first workspace to start organizing boards.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsCreateWorkspaceOpen(true)}
          className="h-9 gap-1.5 rounded-xl bg-primary-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workspace</span>
        </Button>

        <CreateWorkspaceModal
          isOpen={isCreateWorkspaceOpen}
          onClose={() => setIsCreateWorkspaceOpen(false)}
        />
      </div>
    );
  }

  const isArchived = workspace.status === "archived";

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
        onArchiveClick={handleArchiveWorkspace}
        onRestoreClick={handleRestoreWorkspace}
      />

      {/* 2. Archived Notice Banner */}
      {isArchived && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
          <FolderArchive className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            This workspace is archived. Boards and workspace configurations are read-only.
          </span>
        </div>
      )}

      {/* 3. Workspace Navigation Tabs */}
      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        boardCount={localActiveBoardCount}
        memberCount={workspace.memberCount}
      />

      {/* 4. Tab Content Area */}
      {activeTab === "overview" ? (
        <WorkspaceOverviewPanel
          workspace={workspace}
          boards={boards}
          onCreateBoardClick={() => setIsCreateOpen(true)}
        />
      ) : activeTab === "members" ? (
        <WorkspaceMembersPanel workspace={workspace} />
      ) : activeTab === "settings" ? (
        <WorkspaceSettingsPanel workspace={workspace} />
      ) : activeTab === "boards" ? (
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
                        onArchive={isArchived ? undefined : handleArchiveBoard}
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
                        onRestore={
                          isArchived
                            ? () =>
                                toast.error(
                                  "Cannot restore boards in an archived workspace."
                                )
                            : handleRestoreBoard
                        }
                        onDelete={isArchived ? undefined : handleDeleteBoard}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* 5. Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateBoard}
        workspaceId={workspace.id}
        isSubmitting={isSubmitting}
      />

      {/* 6. Safe Delete Confirmation Dialog */}
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
