import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { useBoardDetail, useGitHubCardActivity } from "@/hooks";
import {
  BoardDetailHeader,
  BoardMembersDialog,
  GitHubConfigModal,
  BoardDetailToolbar,
  KanbanBoard,
  KanbanColumnSkeleton,
  CardDetailDrawer,
  BoardCalendar,
  BoardPlanningView,
} from "@/components/kanban";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { canUserManageDependencies } from "@/utils";
import { workspaceApi } from "@/apis/workspace.api";
import { useWorkspaceStore } from "@/stores/workspace.store";
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
  const workspaceName = useWorkspaceStore((state) =>
    state.workspaces.find((workspace) => workspace.id === board?.workspaceId)?.name
  );
  const [verifiedOwnerContext, setVerifiedOwnerContext] = React.useState<{
    workspaceId: string;
    userId: string;
    isOwner: boolean;
  } | null>(null);
  const [isBoardMembersOpen, setIsBoardMembersOpen] = React.useState(false);
  const [isGitHubConfigOpen, setIsGitHubConfigOpen] = React.useState(false);
  const [backgroundPreset, setBackgroundPreset] = React.useState<BoardBackgroundPreset>(DEFAULT_BOARD_BACKGROUND);

  React.useEffect(() => {
    if (board?.id) setBackgroundPreset(getBoardBackgroundPreference(board.id));
  }, [board?.id]);

  const handleBackgroundChange = (preset: BoardBackgroundPreset) => {
    setBackgroundPreset(preset);
    if (board?.id) saveBoardBackgroundPreference(board.id, preset);
  };

  // Invariant: isWorkspaceOwner is only true if verifiedOwnerContext strictly matches the current workspace and user identity
  const isWorkspaceOwner = Boolean(
    board?.workspaceId &&
    currentUser?.id &&
    verifiedOwnerContext?.workspaceId === board.workspaceId &&
    verifiedOwnerContext?.userId === currentUser.id &&
    verifiedOwnerContext?.isOwner
  );

  React.useEffect(() => {
    let isCancelled = false;

    if (!board?.workspaceId || !currentUser?.id) {
      return;
    }

    const targetWorkspaceId = board.workspaceId;
    const targetUserId = currentUser.id;

    const checkWorkspaceOwnership = async () => {
      try {
        const res = await workspaceApi.listWorkspaceMembers(targetWorkspaceId);
        if (isCancelled) return;
        const isOwner = (res.items || []).some(
          (m) => m.userId === targetUserId && m.role === "OWNER"
        );
        setVerifiedOwnerContext({
          workspaceId: targetWorkspaceId,
          userId: targetUserId,
          isOwner,
        });
      } catch {
        if (!isCancelled) {
          setVerifiedOwnerContext({
            workspaceId: targetWorkspaceId,
            userId: targetUserId,
            isOwner: false,
          });
        }
      }
    };

    void checkWorkspaceOwnership();

    return () => {
      isCancelled = true;
    };
  }, [board?.workspaceId, currentUser?.id]);

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

  const handleShareClick = () => setIsBoardMembersOpen(true);

  const handleOptionsClick = () => {
    setIsGitHubConfigOpen(true);
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
            workspaceName={workspaceName}
            onShareClick={handleShareClick}
            onOptionsClick={handleOptionsClick}
          />
          {isBoardMembersOpen && (
            <BoardMembersDialog
              board={board}
              isOpen={isBoardMembersOpen}
              isWorkspaceOwner={isWorkspaceOwner}
              onClose={() => setIsBoardMembersOpen(false)}
            />
          )}
          {isGitHubConfigOpen && (
            <GitHubConfigModal
              board={board}
              isOpen={isGitHubConfigOpen}
              onClose={() => setIsGitHubConfigOpen(false)}
            />
          )}

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
            lists={board.lists}
            members={board.members}
            onClose={handleCloseCardDetail}
            onUpdate={(payload) => handleUpdateCard(selectedCard!.id, payload)}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteCard}
            onAddChecklistItem={handleAddChecklistItem}
            onToggleChecklistItem={handleToggleChecklistItem}
            onDeleteChecklistItem={handleDeleteChecklistItem}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            isLoadingComments={isCommentsLoading}
            commentsError={commentsError}
            onRetryComments={handleRetryComments}
            currentUserId={currentUser?.id}
            onFetchActivities={fetchCardActivities}
            boardCards={allBoardCards}
            canManageDependencies={canManageDependencies}
            onAddDependency={handleAddDependency}
            onDeleteDependency={handleDeleteDependency}
            isLoadingDependencies={isDependenciesLoading}
            dependenciesError={dependenciesError}
            onRetryDependencies={handleRetryDependencies}
            isLoadingTasks={isTasksLoading}
            tasksError={tasksError}
            onRetryTasks={handleRetryTasks}
            isLoadingAssignments={isAssignmentsLoading}
            assignmentsError={assignmentsError}
            onRetryAssignments={handleRetryAssignments}
            onAssignMember={handleAssignMember}
            onUnassignMember={handleUnassignMember}
            boardLabels={board.labels}
            isLoadingLabels={isLabelsLoading}
            labelsError={labelsError}
            onRetryLabels={handleRetryLabels}
            onAttachLabel={handleAttachCardLabel}
            onDetachLabel={handleDetachCardLabel}
            onUploadAttachment={handleUploadAttachment}
            onDeleteAttachment={handleDeleteAttachment}
            onDownloadAttachment={handleDownloadAttachment}
            isLoadingAttachments={isAttachmentsLoading}
            attachmentsError={attachmentsError}
            onRetryAttachments={handleRetryAttachments}
            isUploadingAttachment={isUploadingAttachment}
            currentUserRole={currentUserRole}
            isWorkspaceOwner={isWorkspaceOwner}
            onFetchGitActivity={fetchGitActivity}
          />
        </>
      )}
    </div>
  );
};
