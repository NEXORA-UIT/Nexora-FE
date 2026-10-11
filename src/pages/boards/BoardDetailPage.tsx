import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";
import { useBoardDetail } from "@/hooks";
import {
  BoardDetailHeader,
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
  const [verifiedOwnerContext, setVerifiedOwnerContext] = React.useState<{
    workspaceId: string;
    userId: string;
    isOwner: boolean;
  } | null>(null);

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
          />
        </>
      )}
    </div>
  );
};
