import * as React from "react";
import { addMonths, subMonths } from "date-fns";
import { CalendarToolbar } from "./CalendarToolbar";
import { CalendarMonthView } from "./CalendarMonthView";
import { CalendarAgendaView } from "./CalendarAgendaView";
import { getCalendarMonthDays, getUnscheduledCards } from "./calendar.utils";
import type { KanbanCard, KanbanList } from "@/types";

export interface BoardCalendarProps {
  lists: KanbanList[];
  onCardClick: (card: KanbanCard) => void;
  initialDate?: Date;
}

export const BoardCalendar: React.FC<BoardCalendarProps> = ({
  lists,
  onCardClick,
  initialDate,
}) => {
  const [currentDate, setCurrentDate] = React.useState<Date>(() => initialDate || new Date());

  // Flatten all cards from active lists
  const allCards = React.useMemo(() => {
    return lists.flatMap((list) => list.cards);
  }, [lists]);

  // Derived days for month grid
  const days = React.useMemo(() => {
    return getCalendarMonthDays(currentDate, allCards);
  }, [currentDate, allCards]);

  // Derived count of cards without dates
  const unscheduledCount = React.useMemo(() => {
    return getUnscheduledCards(allCards).length;
  }, [allCards]);

  const handlePrevPeriod = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextPeriod = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex flex-col space-y-3 pb-6">
      {/* Calendar Navigation Toolbar */}
      <CalendarToolbar
        currentDate={currentDate}
        onPrevPeriod={handlePrevPeriod}
        onNextPeriod={handleNextPeriod}
        onToday={handleToday}
        unscheduledCount={unscheduledCount}
      />

      {/* Desktop & Tablet Month Grid (7-column view, hidden on mobile < 768px via CSS) */}
      <div className="hidden md:block">
        <CalendarMonthView days={days} onCardClick={onCardClick} />
      </div>

      {/* Mobile Agenda View (date-grouped stream, shown only on mobile < 768px via CSS) */}
      <div className="block md:hidden">
        <CalendarAgendaView currentDate={currentDate} cards={allCards} onCardClick={onCardClick} />
      </div>
    </div>
  );
};
