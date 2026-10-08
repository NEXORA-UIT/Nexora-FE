# Board-Level Planning / Calendar View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a board-level planning and calendar visualization of existing project cards on `/boards/:boardId` with a 7-column Month grid (desktop/tablet), date navigation, responsive Agenda view (mobile), and canonical `CardDetailDrawer` integration.

**Architecture:** Derive calendar data purely from existing `board.lists` through `useBoardDetail` and `filteredLists` without creating separate calendar entities or secondary stores. Maintain a single source of truth: clicking a calendar card sets `selectedCard` and opens the canonical `CardDetailDrawer`, where edits/deletions immediately update the calendar view.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, `date-fns` v4, Radix UI Dialog, Lucide React, Vitest & Testing Library.

**Spec:** Defined in Nexora Project Management Core Board-Level Planning / Calendar View specification.

---

## Global Constraints

- **Route preservation:** Keep `/boards/:boardId`. The Calendar view is an in-board view mode alongside Kanban Board, toggled via the existing `activeView: "board" | "calendar"` in `BoardDetailToolbar`.
- **Single Source of Truth:** Hierarchy remains `Workspace → Board → List → Card → Task`. Do NOT create new entities (`Event`, `CalendarItem`, `recurrence`, etc.).
- **Read-only interaction on Canvas:** Calendar cards are clickable triggers for `CardDetailDrawer`. No drag-to-reschedule (deferred until backend mutation contract supports it).
- **Date Semantics:** Placement priority is strictly `dueDate` → `startDate` fallback → unscheduled. If both `startDate` and `dueDate` exist, the card is placed on `dueDate`. Do NOT render multi-day range bars in P0. Dateless cards are excluded from calendar cells.
- **Timezone Safety:** Do not rely on naive `parseISO()` which can shift dates depending on UTC offset. Extract calendar date keys (`yyyy-MM-dd`) consistently and compare with local calendar day keys.
- **Responsive Architecture (CSS-first):** Use CSS responsive utilities (`hidden md:block` for Month Grid, `block md:hidden` for Agenda View). Do NOT use JavaScript `useMediaQuery` state.
- **View Mode:** Do not provide a user-facing Month/Agenda toggle in P0. Agenda is strictly the mobile viewport representation of the same calendar state.
- **Unscheduled Cards:** Provide only a lightweight pill counter (e.g. `3 unscheduled`) in the toolbar. Do not build an unscheduled management modal or workflow.
- **Design System Rules:** Strict Inter typography, 4px baseline spacing rhythm, Primary Blue palette (`#2563EB`), ZERO gradients, flat surfaces, WCAG 2.1 AA contrast.

---

## Review Focus

1. **Timezone consistency:** ISO UTC strings (e.g., `2026-09-28T00:00:00.000Z`) must map to `"2026-09-28"` in all timezones, avoiding off-by-one shifts (e.g., displaying on Sep 27 in western timezones).
2. **Date fallback logic:** Cards with only `dueDate` map to `dueDate`; cards with both map to `dueDate`; cards with only `startDate` fallback to `startDate`; cards with neither are excluded from cells.
3. **Day cell overflow ($> 2$ cards):** Cells with $> 2$ cards show 2 chips and an accessible `+N more` button opening a popover listing all cards for that day.
4. **Month navigation correctness:** Clicking Next/Previous updates `currentDate` and toolbar header (e.g. "September 2026" $\rightarrow$ "October 2026"), re-rendering the correct month's cards.
5. **Mobile layout stability:** Agenda view stacks dates and cards cleanly on 390px viewports without horizontal clipping or scrollbars.

---

## File Structure

```text
src/
├── components/
│   └── kanban/
│       ├── calendar/
│       │   ├── calendar.utils.ts           # Date extraction, grid calculation & card mapping
│       │   ├── CalendarCardChip.tsx        # Compact card chip with status dot, code, title, priority
│       │   ├── CalendarDayCell.tsx         # Day cell, today highlight, card chips, +N more popover
│       │   ├── CalendarMonthView.tsx       # 7-column weekday headers (Mon-Sun) & week rows
│       │   ├── CalendarAgendaView.tsx      # Mobile date-grouped list view (< 768px via CSS)
│       │   ├── CalendarToolbar.tsx         # Month navigation, Today button, unscheduled counter
│       │   ├── BoardCalendar.tsx           # Master Calendar container combining toolbar & CSS responsive views
│       │   ├── index.ts                    # Barrel export
│       │   └── __tests__/
│       │       ├── calendar.utils.test.ts
│       │       ├── CalendarDayCell.test.tsx
│       │       ├── CalendarMonthView.test.tsx
│       │       ├── CalendarAgendaView.test.tsx
│       │       └── BoardCalendar.test.tsx
│       └── index.ts                        # Re-export BoardCalendar
└── pages/
    └── boards/
        ├── BoardDetailPage.tsx             # Replace calendar placeholder with <BoardCalendar />
        └── __tests__/
            └── BoardDetailPage.calendar.test.tsx
```

---

### Task 1: Calendar Date Derivation & Utilities (`calendar.utils.ts`)

**Files:**
- Create: `src/components/kanban/calendar/calendar.utils.ts`
- Test: `src/components/kanban/calendar/__tests__/calendar.utils.test.ts`

**Interfaces:**
- Consumes: `KanbanCard` from `@/types`
- Produces:
  ```ts
  export interface CalendarDay {
    date: Date;
    dateString: string; // "yyyy-MM-dd"
    dayOfMonth: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    cards: KanbanCard[];
  }

  export function getCardTargetDateString(card: KanbanCard): string | null;
  export function getCalendarMonthDays(currentDate: Date, cards: KanbanCard[]): CalendarDay[];
  export function getAgendaGroups(currentDate: Date, cards: KanbanCard[]): { date: Date; dateString: string; cards: KanbanCard[] }[];
  export function getUnscheduledCards(cards: KanbanCard[]): KanbanCard[];
  export function formatPeriodTitle(currentDate: Date): string;
  ```

- [ ] **Step 1: Write the failing test for `calendar.utils.ts`**

```ts
import { describe, it, expect } from "vitest";
import {
  getCardTargetDateString,
  getCalendarMonthDays,
  getAgendaGroups,
  getUnscheduledCards,
  formatPeriodTitle,
} from "../calendar.utils";
import type { KanbanCard } from "@/types";

describe("calendar.utils", () => {
  const createCard = (partial: Partial<KanbanCard>): KanbanCard => ({
    id: "card-default",
    listId: "l-1",
    boardId: "b-1",
    code: "NEX-100",
    title: "Default card",
    priority: "MEDIUM",
    position: 1024,
    status: "ACTIVE",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    updatedAt: "2026-09-20T00:00:00.000Z",
    createdAt: "2026-09-15T00:00:00.000Z",
    ...partial,
  });

  describe("getCardTargetDateString", () => {
    it("prioritizes dueDate when both dueDate and startDate are present", () => {
      const card = createCard({
        startDate: "2026-09-20T00:00:00.000Z",
        dueDate: "2026-09-28T00:00:00.000Z",
      });
      expect(getCardTargetDateString(card)).toBe("2026-09-28");
    });

    it("falls back to startDate when dueDate is absent", () => {
      const card = createCard({
        startDate: "2026-09-20T00:00:00.000Z",
        dueDate: null,
      });
      expect(getCardTargetDateString(card)).toBe("2026-09-20");
    });

    it("returns null when neither dueDate nor startDate is present", () => {
      const card = createCard({ startDate: null, dueDate: null });
      expect(getCardTargetDateString(card)).toBeNull();
    });

    it("handles timezone boundaries consistently by parsing YYYY-MM-DD", () => {
      const cardA = createCard({ dueDate: "2026-10-01T00:00:00.000Z" });
      const cardB = createCard({ dueDate: "2026-10-01T23:59:59.999Z" });
      expect(getCardTargetDateString(cardA)).toBe("2026-10-01");
      expect(getCardTargetDateString(cardB)).toBe("2026-10-01");
    });
  });

  describe("getCalendarMonthDays", () => {
    it("generates a Monday-start grid of 35 or 42 days", () => {
      const days = getCalendarMonthDays(new Date(2026, 8, 15), []); // Sep 2026
      expect(days.length % 7).toBe(0);
      expect(days.length).toBeGreaterThanOrEqual(35);
      // First day of grid for Sep 2026 should be Monday Aug 31
      expect(days[0].dateString).toBe("2026-08-31");
    });

    it("places cards on the correct date cells and ignores dateless cards", () => {
      const cardWithDue = createCard({ code: "NEX-101", dueDate: "2026-09-28T00:00:00.000Z" });
      const cardWithStartOnly = createCard({ code: "NEX-102", startDate: "2026-09-15T00:00:00.000Z", dueDate: null });
      const cardDateless = createCard({ code: "NEX-103", startDate: null, dueDate: null });

      const days = getCalendarMonthDays(new Date(2026, 8, 1), [cardWithDue, cardWithStartOnly, cardDateless]);

      const sep28 = days.find((d) => d.dateString === "2026-09-28");
      const sep15 = days.find((d) => d.dateString === "2026-09-15");

      expect(sep28?.cards.map((c) => c.code)).toContain("NEX-101");
      expect(sep15?.cards.map((c) => c.code)).toContain("NEX-102");

      const allPlacedCards = days.flatMap((d) => d.cards);
      expect(allPlacedCards.some((c) => c.code === "NEX-103")).toBe(false);
    });
  });

  describe("getUnscheduledCards", () => {
    it("identifies cards without any dates", () => {
      const scheduled = createCard({ dueDate: "2026-09-28T00:00:00.000Z" });
      const unscheduled = createCard({ startDate: null, dueDate: null });
      const result = getUnscheduledCards([scheduled, unscheduled]);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(unscheduled);
    });
  });

  describe("formatPeriodTitle", () => {
    it("formats month and year title correctly", () => {
      expect(formatPeriodTitle(new Date(2026, 8, 15))).toBe("September 2026");
      expect(formatPeriodTitle(new Date(2026, 9, 1))).toBe("October 2026");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/calendar.utils.test.ts`
Expected: FAIL with missing module `calendar.utils.ts`

- [ ] **Step 3: Implement `calendar.utils.ts`**

Extract calendar date string via regex `/^(\d{4})-(\d{2})-(\d{2})/`. Use `date-fns` functions (`startOfMonth`, `endOfMonth`, `startOfWeek`, `endOfWeek`, `eachDayOfInterval`, `format`, `isSameMonth`, `isToday`) with `{ weekStartsOn: 1 }` (Monday).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/kanban/calendar/__tests__/calendar.utils.test.ts`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/calendar.utils.ts src/components/kanban/calendar/__tests__/calendar.utils.test.ts
git commit -m "feat(calendar): implement date derivation, timezone normalization, and month grid utilities"
```

---

### Task 2: Calendar Card Item & Day Cell Components (`CalendarCardChip.tsx`, `CalendarDayCell.tsx`)

**Files:**
- Create: `src/components/kanban/calendar/CalendarCardChip.tsx`
- Create: `src/components/kanban/calendar/CalendarDayCell.tsx`
- Test: `src/components/kanban/calendar/__tests__/CalendarDayCell.test.tsx`

**Interfaces:**
- Consumes: `KanbanCard` from `@/types`, `CalendarDay` from `./calendar.utils`
- Produces:
  ```ts
  export interface CalendarCardChipProps {
    card: KanbanCard;
    onClick: (card: KanbanCard) => void;
  }
  export const CalendarCardChip: React.FC<CalendarCardChipProps>;

  export interface CalendarDayCellProps {
    day: CalendarDay;
    onCardClick: (card: KanbanCard) => void;
  }
  export const CalendarDayCell: React.FC<CalendarDayCellProps>;
  ```

- [ ] **Step 1: Write the failing test for `CalendarDayCell.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarDayCell } from "../CalendarDayCell";
import type { CalendarDay } from "../calendar.utils";
import type { KanbanCard } from "@/types";

describe("CalendarDayCell", () => {
  const cardA: KanbanCard = {
    id: "c-1",
    listId: "l-1",
    boardId: "b-1",
    code: "NEX-101",
    title: "Card One",
    priority: "HIGH",
    position: 1024,
    status: "ACTIVE",
    dueDate: "2026-09-28T00:00:00.000Z",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    updatedAt: "2026-09-20T00:00:00.000Z",
    createdAt: "2026-09-15T00:00:00.000Z",
  };
  const cardB = { ...cardA, id: "c-2", code: "NEX-102", title: "Card Two" };
  const cardC = { ...cardA, id: "c-3", code: "NEX-103", title: "Card Three" };

  const day: CalendarDay = {
    date: new Date(2026, 8, 28),
    dateString: "2026-09-28",
    dayOfMonth: 28,
    isCurrentMonth: true,
    isToday: false,
    cards: [cardA, cardB, cardC],
  };

  it("renders day number and primary cards", () => {
    const handleCardClick = vi.fn();
    render(<CalendarDayCell day={day} onCardClick={handleCardClick} />);

    expect(screen.getByText("28")).toBeDefined();
    expect(screen.getByText("Card One")).toBeDefined();
    expect(screen.getByText("Card Two")).toBeDefined();
  });

  it("renders +1 more overflow button and opens popover listing all cards", () => {
    const handleCardClick = vi.fn();
    render(<CalendarDayCell day={day} onCardClick={handleCardClick} />);

    const moreBtn = screen.getByRole("button", { name: /\+1 more/i });
    expect(moreBtn).toBeDefined();

    fireEvent.click(moreBtn);
    expect(screen.getByText("Card Three")).toBeDefined();
  });

  it("triggers onCardClick when clicking a card chip", () => {
    const handleCardClick = vi.fn();
    render(<CalendarDayCell day={day} onCardClick={handleCardClick} />);

    fireEvent.click(screen.getByText("Card One"));
    expect(handleCardClick).toHaveBeenCalledWith(cardA);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarDayCell.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `CalendarCardChip.tsx` and `CalendarDayCell.tsx`**

- `CalendarCardChip`:
  - Render as semantic `<button>` with accessible `aria-label`.
  - Dot status indicator: TODO (`bg-neutral-400`), IN_PROGRESS (`bg-primary-500`), DONE (`bg-emerald-500`).
  - Monospace code badge (`NEX-101`), truncated title, priority pill/badge.
  - Hover background `#F3F4F6`, focus ring `focus:ring-2 focus:ring-primary-500/20`.
- `CalendarDayCell`:
  - Cell header with date number. If `isToday`, blue circle badge (`bg-primary-600 text-white font-bold`).
  - If `!isCurrentMonth`, muted background `#F9FAFB` and text `#9CA3AF`.
  - Shows first 2 cards; if `day.cards.length > 2`, displays `+${day.cards.length - 2} more` button opening Radix Dialog / Popover.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarDayCell.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/CalendarCardChip.tsx src/components/kanban/calendar/CalendarDayCell.tsx src/components/kanban/calendar/__tests__/CalendarDayCell.test.tsx
git commit -m "feat(calendar): implement calendar card chip and day cell with overflow dialog"
```

---

### Task 3: Calendar Toolbar & Month Grid View (`CalendarToolbar.tsx`, `CalendarMonthView.tsx`)

**Files:**
- Create: `src/components/kanban/calendar/CalendarToolbar.tsx`
- Create: `src/components/kanban/calendar/CalendarMonthView.tsx`
- Test: `src/components/kanban/calendar/__tests__/CalendarMonthView.test.tsx`

**Interfaces:**
- Consumes: `CalendarDayCell`, `calendar.utils.ts`
- Produces:
  ```ts
  export interface CalendarToolbarProps {
    currentDate: Date;
    onPrevPeriod: () => void;
    onNextPeriod: () => void;
    onToday: () => void;
    unscheduledCount: number;
  }
  export const CalendarToolbar: React.FC<CalendarToolbarProps>;

  export interface CalendarMonthViewProps {
    days: CalendarDay[];
    onCardClick: (card: KanbanCard) => void;
  }
  export const CalendarMonthView: React.FC<CalendarMonthViewProps>;
  ```

- [ ] **Step 1: Write the failing test for `CalendarMonthView.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarMonthView } from "../CalendarMonthView";
import { getCalendarMonthDays } from "../calendar.utils";

describe("CalendarMonthView", () => {
  it("renders 7 weekday headers from Mon to Sun in order", () => {
    const days = getCalendarMonthDays(new Date(2026, 8, 15), []);
    render(<CalendarMonthView days={days} onCardClick={vi.fn()} />);

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(7);
    expect(headers[0].textContent).toBe("Mon");
    expect(headers[1].textContent).toBe("Tue");
    expect(headers[2].textContent).toBe("Wed");
    expect(headers[3].textContent).toBe("Thu");
    expect(headers[4].textContent).toBe("Fri");
    expect(headers[5].textContent).toBe("Sat");
    expect(headers[6].textContent).toBe("Sun");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarMonthView.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `CalendarToolbar.tsx` and `CalendarMonthView.tsx`**

- `CalendarToolbar`:
  - Navigation controls: Previous button (`<ChevronLeft />`), Next button (`<ChevronRight />`), Today button (`"Today"`).
  - Period heading: `formatPeriodTitle(currentDate)` (e.g., `September 2026`).
  - Unscheduled count pill: if `unscheduledCount > 0`, render `<span className="inline-flex items-center gap-1 text-xs text-neutral-500 bg-neutral-100 rounded-md px-2 py-1">{unscheduledCount} unscheduled</span>`.
  - Accessible names: `aria-label="Previous month"`, `aria-label="Next month"`, `aria-label="Jump to current date"`.
- `CalendarMonthView`:
  - 7 column headers (Mon to Sun) with `role="columnheader"`.
  - Grid layout: `grid grid-cols-7 border border-neutral-200 rounded-xl overflow-hidden bg-neutral-200 gap-px`.
  - Day cells have minimum height `min-h-[110px] sm:min-h-[125px]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarMonthView.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/CalendarToolbar.tsx src/components/kanban/calendar/CalendarMonthView.tsx src/components/kanban/calendar/__tests__/CalendarMonthView.test.tsx
git commit -m "feat(calendar): implement calendar toolbar and 7-column month grid"
```

---

### Task 4: Responsive Mobile Agenda View (`CalendarAgendaView.tsx`)

**Files:**
- Create: `src/components/kanban/calendar/CalendarAgendaView.tsx`
- Test: `src/components/kanban/calendar/__tests__/CalendarAgendaView.test.tsx`

**Interfaces:**
- Consumes: `CalendarCardChip`, `calendar.utils.ts`, `KanbanCard`
- Produces:
  ```ts
  export interface CalendarAgendaViewProps {
    currentDate: Date;
    cards: KanbanCard[];
    onCardClick: (card: KanbanCard) => void;
  }
  export const CalendarAgendaView: React.FC<CalendarAgendaViewProps>;
  ```

- [ ] **Step 1: Write the failing test for `CalendarAgendaView.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarAgendaView } from "../CalendarAgendaView";
import type { KanbanCard } from "@/types";

describe("CalendarAgendaView", () => {
  const card: KanbanCard = {
    id: "c-1",
    listId: "l-1",
    boardId: "b-1",
    code: "NEX-101",
    title: "Mobile test card",
    priority: "HIGH",
    position: 1024,
    status: "ACTIVE",
    dueDate: "2026-09-28T00:00:00.000Z",
    assignees: [],
    labels: [],
    tasksCount: 0,
    completedTasksCount: 0,
    updatedAt: "2026-09-20T00:00:00.000Z",
    createdAt: "2026-09-15T00:00:00.000Z",
  };

  it("renders scheduled cards grouped chronologically by date", () => {
    const handleCardClick = vi.fn();
    render(
      <CalendarAgendaView
        currentDate={new Date(2026, 8, 15)}
        cards={[card]}
        onCardClick={handleCardClick}
      />
    );

    expect(screen.getByText("Mobile test card")).toBeDefined();
    expect(screen.getByText(/Sep 28/i)).toBeDefined();

    fireEvent.click(screen.getByText("Mobile test card"));
    expect(handleCardClick).toHaveBeenCalledWith(card);
  });

  it("renders intentional empty state when no cards are scheduled in the period", () => {
    render(
      <CalendarAgendaView
        currentDate={new Date(2026, 8, 15)}
        cards={[]}
        onCardClick={vi.fn()}
      />
    );

    expect(screen.getByText("No scheduled work")).toBeDefined();
    expect(screen.getByText(/There are no cards with dates in this period/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarAgendaView.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `CalendarAgendaView.tsx`**

- Group cards for the current month using `getAgendaGroups(currentDate, cards)`.
- Render a vertical stream of dates: date header (`badge` or sticky date title) with list of card chips.
- Full width, touch friendly (`min-h-[44px]`), no horizontal overflow.
- If zero scheduled cards exist in the current period, render intentional empty state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarAgendaView.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/CalendarAgendaView.tsx src/components/kanban/calendar/__tests__/CalendarAgendaView.test.tsx
git commit -m "feat(calendar): implement mobile agenda date-grouped view"
```

---

### Task 5: Master `BoardCalendar` Component & Integration with `BoardDetailPage`

**Files:**
- Create: `src/components/kanban/calendar/BoardCalendar.tsx`
- Create: `src/components/kanban/calendar/index.ts`
- Modify: `src/components/kanban/index.ts`
- Modify: `src/pages/boards/BoardDetailPage.tsx`
- Test: `src/components/kanban/calendar/__tests__/BoardCalendar.test.tsx`

**Interfaces:**
- Consumes: `BoardCalendarProps`, `filteredLists`, `handleSelectCard` from `useBoardDetail`
- Produces:
  ```ts
  export interface BoardCalendarProps {
    lists: KanbanList[];
    onCardClick: (card: KanbanCard) => void;
  }
  export const BoardCalendar: React.FC<BoardCalendarProps>;
  ```

- [ ] **Step 1: Write the failing test for `BoardCalendar.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoardCalendar } from "../BoardCalendar";
import { MOCK_BOARD_DETAIL } from "@/mocks/data/kanban.mock";

describe("BoardCalendar", () => {
  it("renders calendar toolbar and navigation buttons", () => {
    const handleCardClick = vi.fn();
    render(
      <BoardCalendar
        lists={MOCK_BOARD_DETAIL.lists}
        onCardClick={handleCardClick}
      />
    );

    expect(screen.getByRole("button", { name: /Previous month/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Next month/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Jump to current date/i })).toBeDefined();
    expect(screen.getByText("Mon")).toBeDefined();
  });

  it("advances month when clicking Next month button and returns to Today", () => {
    render(
      <BoardCalendar
        lists={MOCK_BOARD_DETAIL.lists}
        onCardClick={vi.fn()}
      />
    );

    const initialTitle = screen.getByRole("heading", { level: 2 }).textContent;
    const nextBtn = screen.getByRole("button", { name: /Next month/i });
    fireEvent.click(nextBtn);

    const updatedTitle = screen.getByRole("heading", { level: 2 }).textContent;
    expect(updatedTitle).not.toBe(initialTitle);

    const todayBtn = screen.getByRole("button", { name: /Jump to current date/i });
    fireEvent.click(todayBtn);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/BoardCalendar.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `BoardCalendar.tsx`, barrel exports, and wire up `BoardDetailPage.tsx`**

- `BoardCalendar.tsx`:
  - Holds `currentDate` navigation state (`useState(new Date())`).
  - Derives `allCards = lists.flatMap(l => l.cards)`.
  - Calculates `unscheduledCount = getUnscheduledCards(allCards).length`.
  - Calculates `days = getCalendarMonthDays(currentDate, allCards)`.
  - Renders `CalendarToolbar`.
  - CSS-first responsive views:
    ```tsx
    <div className="space-y-4">
      <CalendarToolbar
        currentDate={currentDate}
        onPrevPeriod={() => setCurrentDate(prev => subMonths(prev, 1))}
        onNextPeriod={() => setCurrentDate(prev => addMonths(prev, 1))}
        onToday={() => setCurrentDate(new Date())}
        unscheduledCount={unscheduledCount}
      />
      {/* Desktop/Tablet Month Grid */}
      <div className="hidden md:block">
        <CalendarMonthView days={days} onCardClick={onCardClick} />
      </div>
      {/* Mobile Agenda View */}
      <div className="block md:hidden">
        <CalendarAgendaView currentDate={currentDate} cards={allCards} onCardClick={onCardClick} />
      </div>
    </div>
    ```
- In `src/pages/boards/BoardDetailPage.tsx`:
  - Replace lines 128-145 (the placeholder calendar box) with:
    ```tsx
    {activeView === "calendar" ? (
      <BoardCalendar
        lists={filteredLists}
        onCardClick={handleSelectCard}
      />
    ) : (
      <div className="flex-1 min-h-0">
        <KanbanBoard ... />
      </div>
    )}
    ```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/BoardCalendar.tsx src/components/kanban/calendar/index.ts src/components/kanban/index.ts src/pages/boards/BoardDetailPage.tsx src/components/kanban/calendar/__tests__/BoardCalendar.test.tsx
git commit -m "feat(calendar): integrate BoardCalendar view with BoardDetailPage and CardDetailDrawer"
```

---

### Task 6: Verification & Quality Gates

- [ ] **Step 1: Run complete test suite**
Run: `npm test`
Expected: All tests pass (0 failures).

- [ ] **Step 2: Run TypeScript typecheck**
Run: `npm run typecheck`
Expected: `tsc --noEmit` exits with 0 errors.

- [ ] **Step 3: Run ESLint**
Run: `npm run lint`
Expected: `eslint .` exits with 0 warnings, 0 errors.

- [ ] **Step 4: Run production build**
Run: `npm run build`
Expected: `tsc -b && vite build` succeeds without build errors.

- [ ] **Step 5: In-Browser QA Verification (Desktop & 390px Mobile)**
Verify via `browser_subagent`:
1. Navigate to `/boards/board-website-redesign`.
2. Toggle View Switcher: Board $\rightarrow$ Calendar.
3. Verify 7-column Month grid, Today highlight, correct card chips on due dates.
4. Click card `NEX-101` $\rightarrow$ CardDetailDrawer opens on right side.
5. Edit title or status $\rightarrow$ updates on Calendar.
6. Close drawer $\rightarrow$ returns to Calendar.
7. Resize to 390px mobile viewport $\rightarrow$ reflows into Agenda view, no horizontal overflow.
