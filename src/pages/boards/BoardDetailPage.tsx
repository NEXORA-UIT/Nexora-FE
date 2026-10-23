import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { useBoardDetail, useGitHubCardActivity } from "@/hooks";
import {
  BoardDetailHeader,
  BoardDetailToolbar,
  BoardMembersDialog,
  KanbanBoard,
  KanbanColumnSkeleton,
  CardDetailDrawer,
  BoardCalendar,
  BoardPlanningView,
} from "@/components/kanban";

import { Button } from "@/components/ui/button";
import { EditBoardModal } from "@/components/boards";
import { useAuthStore } from "@/stores/auth.store";
import { useWorkspaceStore } from "@/stores/workspace.store";
import { canUserManageDependencies } from "@/utils";
import { isWorkspaceArchived, isWorkspaceFrozen, assertWorkspaceIsOperable } from "@/utils/workspace";
import { useWorkspaceOwnership } from "@/hooks/useWorkspaceOwnership";
import {
  DEFAULT_BOARD_BACKGROUND,
  getBoardBackgroundPreference,
  saveBoardBackgroundPreference,
  type BoardBackgroundPreset,
} from "@/components/kanban/board-background";

export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { fetchGitActivity } = useGitHubCardActivity();

  const {
    board,
    filteredLists,
    isLoading,
    error,
    reload,
    wsStatus,
    isLive,
    searchQuery,
    setSearchQuery,
    cardFilters,
    setCardFilters,
    activeView,
    setActiveView,
    selectedCardId,
    selectedCard,
    handleSelectCard,
    handleCloseCardDetail,
    handleAddCard,
    handleAddColumn,
    handleCommitMoveCard,
    handleStatusChange,
    handleUpdateCard,
    handleDeleteCard,
    handleAddChecklistItem,
    handleToggleChecklistItem,
    handleDeleteChecklistItem,
    isTasksLoading,
    tasksError,
    handleRetryTasks,
    isAssignmentsLoading,
    assignmentsError,
    handleRetryAssignments,
    handleAssignMember,
    handleUnassignMember,
    isLabelsLoading,
    labelsError,
    handleRetryLabels,
    handleAttachCardLabel,
    handleDetachCardLabel,
    handleCreateBoardLabel,
    isCommentsLoading,
    commentsError,
    handleRetryComments,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
    isAttachmentsLoading,
    attachmentsError,
    isUploadingAttachment,
    handleRetryAttachments,
    handleUploadAttachment,
    handleDeleteAttachment,
    handleDownloadAttachment,
    fetchCardActivities,
    allBoardCards,
    isDependenciesLoading,
    dependenciesError,
    handleRetryDependencies,
    handleAddDependency,
    handleDeleteDependency,
    handleUpdateBoard,
  } = useBoardDetail(boardId);

  const currentUser = useAuthStore((state) => state.user);
  const { isWorkspaceOwner } = useWorkspaceOwnership(
    board?.workspaceId,
    currentUser?.id
  );
  const workspace = useWorkspaceStore((state) =>
    state.workspaces.find((w) => w.id === board?.workspaceId) || state.getActiveWorkspace()
  );
  const [backgroundPreset, setBackgroundPreset] = React.useState<BoardBackgroundPreset>(DEFAULT_BOARD_BACKGROUND);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = React.useState(false);
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (board?.id) setBackgroundPreset(getBoardBackgroundPreference(board.id));
  }, [board?.id]);

  const handleBackgroundChange = (preset: BoardBackgroundPreset) => {
    setBackgroundPreset(preset);
    if (board?.id) saveBoardBackgroundPreference(board.id, preset);
  };


  const currentUserRole = React.useMemo(() => {
    if (!board || !currentUser) return undefined;
    const member = (board.members || []).find((m) => m.id === currentUser.id);
    return member?.role;
  }, [board, currentUser]);

  // Authoritative role-based permission for card dependencies (PM & Owner only)
  const canManageDependencies = React.useMemo(() => {
    if (!board) return false;
    if (isWorkspaceOwner) return true;
    const member = (board.members || []).find(
      (m) =>
        (currentUser && m.id === currentUser.id) ||
        (currentUser && m.name === currentUser.fullName) ||
        m.name === "Phan Gia Đạt" // Primary authenticated workspace user
    );
    const role = member?.role;
    return canUserManageDependencies(role);
  }, [board, currentUser, isWorkspaceOwner]);

  const canManageBoard = Boolean(isWorkspaceOwner || currentUserRole === "PM");
  const isBoardArchived = board?.status === "ARCHIVED";
  const isWorkspaceArchivedVal = isWorkspaceArchived(workspace);
  const isWorkspaceFrozenVal = isWorkspaceFrozen(workspace);

  const isEditDisabled = isBoardArchived || isWorkspaceArchivedVal || isWorkspaceFrozenVal;
  const editDisabledReason = React.useMemo(() => {
    if (isBoardArchived) return "Cannot edit an archived board.";
    if (isWorkspaceArchivedVal) return "Cannot modify boards in an archived workspace.";
    if (isWorkspaceFrozenVal) return "This workspace is frozen and cannot be modified.";
    return undefined;
  }, [isBoardArchived, isWorkspaceArchivedVal, isWorkspaceFrozenVal]);

  const handleEditBoardClick = () => {
    if (!canManageBoard) {
      toast.error("You do not have permission to edit board details.");
      return;
    }
    if (isBoardArchived) {
      toast.error("Cannot edit an archived board.");
      return;
    }
    if (!assertWorkspaceIsOperable(workspace, "modify")) {
      return;
    }
    setIsEditBoardModalOpen(true);
  };

  const handleSubmitEditBoard = async (data: { name: string; description: string | null }) => {
    if (!assertWorkspaceIsOperable(workspace, "modify")) {
      throw new Error(
        isWorkspaceArchivedVal
          ? "Cannot modify boards in an archived workspace."
          : "This workspace is frozen and cannot be modified."
      );
    }
    await handleUpdateBoard({
      name: data.name,
      description: data.description,
    });
    toast.success("Board updated successfully.");
  };

  const handleShareClick = () => {
    setIsMembersDialogOpen(true);
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
            workspaceName={workspace?.name || "Workspace"}
            wsStatus={wsStatus}
            isLive={isLive}
            canManageBoard={canManageBoard}
            onEditBoardClick={handleEditBoardClick}
            isEditDisabled={isEditDisabled}
            editDisabledReason={editDisabledReason}
            onShareClick={handleShareClick}
            onOptionsClick={handleOptionsClick}
          />

          {/* Toolbar */}
          <BoardDetailToolbar
            activeView={activeView}
            onViewChange={setActiveView}
            backgroundPreset={backgroundPreset}
            onBackgroundChange={handleBackgroundChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={cardFilters}
            onFiltersChange={setCardFilters}
            members={board.members}
            labels={board.labels}
            archivedListsCount={board.archivedListsCount}
            onArchivedListsClick={handleArchivedListsClick}
            onFilterClick={handleFilterClick}
          />

          {/* Canvas Views */}
          {activeView === "calendar" ? (
            <div className="flex-1 min-h-0">
              <BoardCalendar
                lists={filteredLists}
                onCardClick={handleSelectCard}
              />
            </div>
          ) : activeView === "planning" ? (
            <div className="flex-1 min-h-0">
              <BoardPlanningView
                boardId={board.id}
                lists={filteredLists}
                onCardClick={handleSelectCard}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <KanbanBoard
                lists={filteredLists}
                backgroundPreset={backgroundPreset}
                onCommitMoveCard={handleCommitMoveCard}
                onAddCard={handleAddCard}
                onAddColumn={handleAddColumn}
                onCardClick={handleSelectCard}
                onColumnOptionsClick={(list) => {
                  toast.info(`Column "${list.name}" options`);
                }}
              />
            </div>
          )}


          {/* Card Detail Side Panel Drawer */}
          <CardDetailDrawer
            card={selectedCard}
            isOpen={Boolean(selectedCardId && selectedCard)}
            onClose={handleCloseCardDetail}
            operations={{
              onUpdate: async (payload) => {
                if (!selectedCard) return;
                await handleUpdateCard(selectedCard.id, payload);
              },
              onDelete: handleDeleteCard,
            }}
            metadata={{
              lists: board.lists,
              members: board.members,
              boardLabels: board.labels,
              onStatusChange: handleStatusChange,
              onAssignMember: handleAssignMember,
              onUnassignMember: handleUnassignMember,
              isLoadingAssignments: isAssignmentsLoading,
              assignmentsError,
              onRetryAssignments: handleRetryAssignments,
              onAttachLabel: handleAttachCardLabel,
              onDetachLabel: handleDetachCardLabel,
              onCreateBoardLabel: handleCreateBoardLabel,
              isLoadingLabels: isLabelsLoading,
              labelsError,
              onRetryLabels: handleRetryLabels,
            }}
            checklist={{
              onAddItem: handleAddChecklistItem,
              onToggleItem: handleToggleChecklistItem,
              onDeleteItem: handleDeleteChecklistItem,
              isLoading: isTasksLoading,
              error: tasksError,
              onRetry: handleRetryTasks,
            }}
            dependencies={{
              boardCards: allBoardCards,
              canManage: canManageDependencies,
              isLoading: isDependenciesLoading,
              error: dependenciesError,
              onRetry: handleRetryDependencies,
              onAddDependency: handleAddDependency,
              onDeleteDependency: handleDeleteDependency,
            }}
            attachments={{
              onUploadAttachment: handleUploadAttachment,
              onDeleteAttachment: handleDeleteAttachment,
              onDownloadAttachment: handleDownloadAttachment,
              isLoadingAttachments: isAttachmentsLoading,
              attachmentsError,
              onRetryAttachments: handleRetryAttachments,
              isUploadingAttachment,
              currentUserId: currentUser?.id,
              currentUserRole,
              isWorkspaceOwner,
            }}
            activity={{
              onAddComment: handleAddComment,
              onUpdateComment: handleUpdateComment,
              onDeleteComment: handleDeleteComment,
              onFetchActivities: fetchCardActivities,
              isLoadingComments: isCommentsLoading,
              commentsError,
              onRetryComments: handleRetryComments,
              currentUserId: currentUser?.id,
              onFetchGitActivity: fetchGitActivity,
            }}
          />

          {/* Board Members Management Dialog */}
          {isMembersDialogOpen && (
            <BoardMembersDialog
              board={board}
              isOpen={isMembersDialogOpen}
              isWorkspaceOwner={isWorkspaceOwner}
              currentUserId={currentUser?.id}
              onClose={() => setIsMembersDialogOpen(false)}
              onMembersChange={() => void reload()}
            />
          )}

          {/* Edit Board Modal */}
          {board && (
            <EditBoardModal
              isOpen={isEditBoardModalOpen}
              onClose={() => setIsEditBoardModalOpen(false)}
              onSubmit={handleSubmitEditBoard}
              initialName={board.name}
              initialDescription={board.description}
            />
          )}
        </>
      )}
    </div>
  );
};
