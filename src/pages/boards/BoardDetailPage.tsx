import * as React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { useBoardDetail, useGitHubCardActivity } from "@/hooks";
import {
  BoardDetailHeader,
  BoardMembersDialog,
  BoardSettingsDialog,
  BoardDetailToolbar,
  KanbanBoard,
  KanbanColumnSkeleton,
  CardDetailDrawer,
  BoardCalendar,
  BoardPlanningView,
} from "@/components/kanban";

import { Button } from "@/components/ui/button";
import { boardApi } from "@/apis/board.api";
import { useAuthStore } from "@/stores/auth.store";
import { canUserManageDependencies } from "@/utils";
import { useWorkspaceOwnership } from "@/hooks/useWorkspaceOwnership";
import {
  DEFAULT_BOARD_BACKGROUND,
  getBoardBackgroundPreference,
  saveBoardBackgroundPreference,
  type BoardBackgroundPreset,
} from "@/components/kanban/board-background";

export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { fetchGitActivity } = useGitHubCardActivity();
  const [isMembersDialogOpen, setIsMembersDialogOpen] = React.useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [isSavingBoard, setIsSavingBoard] = React.useState(false);

  const {
    board,
    filteredLists,
    isLoading,
    error,
    realtimeConnected,
    reload,
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
  } = useBoardDetail(boardId);

  const currentUser = useAuthStore((state) => state.user);
  const { isWorkspaceOwner, verifiedOwnerContext } = useWorkspaceOwnership(
    board?.workspaceId,
    currentUser?.id
  );
  const isOwnerContextVerified = Boolean(
    board?.workspaceId &&
    currentUser?.id &&
    verifiedOwnerContext?.workspaceId === board.workspaceId &&
    verifiedOwnerContext?.userId === currentUser.id
  );
  const [backgroundPreset, setBackgroundPreset] =
    React.useState<BoardBackgroundPreset>(DEFAULT_BOARD_BACKGROUND);

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

  const canManageBoard = isWorkspaceOwner || currentUserRole === "PM";

  const handleSaveBoardSettings = async (input: { name: string; description: string }) => {
    if (!board) return;
    setIsSavingBoard(true);
    try {
      await boardApi.updateBoard(board.id, input);
      await reload();
      setIsSettingsDialogOpen(false);
      toast.success("Board settings saved.");
    } catch (cause) {
      throw new Error(cause instanceof Error ? cause.message : "Could not save Board settings.");
    } finally {
      setIsSavingBoard(false);
    }
  };

  const handleArchiveOrRestoreBoard = async () => {
    if (!board || !canManageBoard) return;
    const isArchived = board.status === "ARCHIVED";
    const action = isArchived ? "restore" : "archive";
    if (!window.confirm(`Are you sure you want to ${action} "${board.name}"?`)) return;

    try {
      if (isArchived) {
        await boardApi.restoreBoard(board.id);
        await reload();
        toast.success("Board restored.");
      } else {
        await boardApi.archiveBoard(board.id);
        toast.success("Board archived.");
        navigate(ROUTES.BOARDS);
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : `Could not ${action} the Board.`);
    }
  };

  const handleLeaveBoard = async () => {
    if (!board || isWorkspaceOwner || currentUserRole !== "MEMBER") return;
    const confirmed = window.confirm(
      `Leave "${board.name}"? Your assignments on this Board will be removed.`
    );
    if (!confirmed) return;

    try {
      await boardApi.leaveBoard(board.id);
      toast.success(`You left "${board.name}".`);
      navigate(ROUTES.BOARDS);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not leave this Board.");
    }
  };

  const leaveBoardDisabledReason = !isOwnerContextVerified
    ? undefined
    : isWorkspaceOwner
      ? "Workspace Owners have access to every Board."
      : currentUserRole === "PM"
        ? "Assign another PM before leaving this Board."
        : board?.status === "ARCHIVED"
          ? "Archived Boards cannot be left."
          : undefined;

  const handleFilterClick = () => {
    toast.info("Filter panel toggled");
  };

  const handleArchivedListsClick = () => {
    toast.info(`${board?.archivedListsCount ?? 0} archived list(s) stored`);
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* 1. Loading State */}
      {isLoading && !board && (
        <div className="space-y-6">
          <div className="h-16 animate-pulse rounded-xl bg-neutral-100" />
          <div className="h-10 animate-pulse rounded-xl bg-neutral-100" />
          <KanbanColumnSkeleton count={3} />
        </div>
      )}

      {/* 2. Error State */}
      {error && !board && (
        <div className="mx-auto my-12 max-w-lg rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-neutral-900">Failed to Load Board</h2>
          <p className="mb-6 mt-1 text-xs text-neutral-600">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => void reload()} className="gap-1.5">
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
            realtimeConnected={realtimeConnected}
            canManageBoard={canManageBoard}
            canLeaveBoard={
              isOwnerContextVerified &&
              currentUserRole === "MEMBER" &&
              !isWorkspaceOwner &&
              board.status === "ACTIVE"
            }
            leaveBoardDisabledReason={leaveBoardDisabledReason}
            onManageMembers={() => setIsMembersDialogOpen(true)}
            onEditBoard={() => setIsSettingsDialogOpen(true)}
            onArchiveBoard={() => void handleArchiveOrRestoreBoard()}
            onLeaveBoard={() => void handleLeaveBoard()}
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
            <div className="min-h-0 flex-1">
              <BoardCalendar lists={filteredLists} onCardClick={handleSelectCard} />
            </div>
          ) : activeView === "planning" ? (
            <div className="min-h-0 flex-1">
              <BoardPlanningView
                boardId={board.id}
                lists={filteredLists}
                onCardClick={handleSelectCard}
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1">
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
          {isMembersDialogOpen && (
            <BoardMembersDialog
              board={board}
              isOpen
              isWorkspaceOwner={isWorkspaceOwner}
              onClose={() => setIsMembersDialogOpen(false)}
            />
          )}
          {isSettingsDialogOpen && (
            <BoardSettingsDialog
              board={board}
              isOpen
              isSaving={isSavingBoard}
              onClose={() => setIsSettingsDialogOpen(false)}
              onSave={handleSaveBoardSettings}
            />
          )}
        </>
      )}
    </div>
  );
};
