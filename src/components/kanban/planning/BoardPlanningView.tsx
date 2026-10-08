import * as React from "react";
import { boardApi } from "@/apis";
import type { KanbanList, BoardDashboard, KanbanCard } from "@/types";
import { PlanningDashboardMetrics } from "./PlanningDashboardMetrics";
import { PlanningScheduleWarnings } from "./PlanningScheduleWarnings";
import { PlanningDependencyOverview } from "./PlanningDependencyOverview";
import { detectScheduleWarnings, getBoardDashboardMetrics } from "@/utils";

export interface BoardPlanningViewProps {
  boardId: string;
  lists: KanbanList[];
  onCardClick: (card: KanbanCard) => void;
}

export const BoardPlanningView: React.FC<BoardPlanningViewProps> = ({
  boardId,
  lists,
  onCardClick,
}) => {
  const [dashboardMetrics, setDashboardMetrics] = React.useState<BoardDashboard | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Fetch production board dashboard metrics as single source of truth
  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    boardApi
      .getBoardDashboard(boardId)
      .then((data) => {
        if (isMounted) {
          setDashboardMetrics(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // Fallback to local calculation for offline/mock resiliency
          setDashboardMetrics(getBoardDashboardMetrics(lists));
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [boardId, lists]);

  // Derive schedule warnings directly from existing KanbanCard.dependencies
  const warnings = React.useMemo(() => {
    return detectScheduleWarnings(lists);
  }, [lists]);

  // All cards from active board lists for dependency overview
  const allCards = React.useMemo(() => {
    return lists.flatMap((l) => l.cards);
  }, [lists]);

  const handleCardClickById = React.useCallback(
    (cardId: string) => {
      const card = allCards.find((c) => c.id === cardId);
      if (card) {
        onCardClick(card);
      }
    },
    [allCards, onCardClick]
  );

  // Resolved metrics: primary API response or intentional offline/mock fallback
  const resolvedMetrics: BoardDashboard = React.useMemo(() => {
    if (dashboardMetrics) return dashboardMetrics;
    return (
      getBoardDashboardMetrics(lists) ?? {
        totalCards: 0,
        completedCards: 0,
        inProgressCards: 0,
        todoCards: 0,
        overdueCards: 0,
        completionRate: 0,
      }
    );
  }, [dashboardMetrics, lists]);

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* 1. Progress Summary Dashboard */}
      <section aria-labelledby="planning-dashboard-heading" className="space-y-2">
        <h2 id="planning-dashboard-heading" className="sr-only">
          Board Progress Dashboard
        </h2>
        <PlanningDashboardMetrics metrics={resolvedMetrics} isLoading={isLoading} />
      </section>

      {/* 2. Schedule Warnings & Blocker Stream */}
      <section aria-labelledby="planning-warnings-heading">
        <h2 id="planning-warnings-heading" className="sr-only">
          Schedule & Blocker Warnings
        </h2>
        <PlanningScheduleWarnings warnings={warnings} onCardClick={handleCardClickById} />
      </section>

      {/* 3. Dependency Overview Matrix */}
      <section aria-labelledby="planning-dependencies-heading">
        <h2 id="planning-dependencies-heading" className="sr-only">
          Dependency Relations Overview
        </h2>
        <PlanningDependencyOverview cards={allCards} onCardClick={handleCardClickById} />
      </section>
    </div>
  );
};
