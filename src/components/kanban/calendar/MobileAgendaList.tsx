import * as React from "react";
import { CalendarAgendaView } from "./CalendarAgendaView";
import type { KanbanCard, KanbanList } from "@/types";

export interface MobileAgendaListProps {
  lists: KanbanList[];
  onCardClick: (card: KanbanCard) => void;
  currentDate?: Date;
}

export const MobileAgendaList: React.FC<MobileAgendaListProps> = ({
  lists,
  onCardClick,
  currentDate = new Date(),
}) => {
  const allCards = React.useMemo(() => lists.flatMap((l) => l.cards), [lists]);
  return (
    <CalendarAgendaView
      currentDate={currentDate}
      cards={allCards}
      onCardClick={onCardClick}
    />
  );
};
