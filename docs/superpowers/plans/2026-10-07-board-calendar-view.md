# Board-Level Planning / Calendar View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a board-level planning and calendar visualization of existing project cards on `/boards/:boardId` with a 7-column Month grid, date navigation, responsive Agenda view for mobile, and canonical `CardDetailDrawer` integration.

**Architecture:** Derive calendar data purely from existing `board.lists` through `useBoardDetail` and `filteredLists` without creating separate calendar entities or secondary stores. Maintain a single source of truth: clicking a calendar card sets `selectedCard` and opens the canonical `CardDetailDrawer`, where edits/deletions immediately update the calendar view.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, `date-fns` v4, Radix UI Dialog & DropdownMenu, Lucide React, Vitest & Testing Library.

**Spec:** Defined in Nexora Project Management Core Board-Level Planning / Calendar View specification.

---

## Global Constraints

- **Route preservation:** Keep `/boards/:boardId`. The Calendar view is an in-board view mode alongside Kanban Board, toggled via the existing `activeView: "board" | "calendar"` in `BoardDetailToolbar`.
- **Single Source of Truth:** Hierarchy remains `Workspace → Board → List → Card → Task`. Do NOT create new entities (`Event`, `CalendarItem`, `recurrence`, etc.).
- **Read-only interaction on Canvas:** Calendar cards are clickable triggers for `CardDetailDrawer`. No drag-to-reschedule (deferred until backend mutation contract supports it).
- **Date Semantics:** Cards are anchored to `dueDate`. If both `startDate` and `dueDate` exist, represent the start/due span clearly. Cards without dates are excluded from the date grid and summarized in an unscheduled indicator.
- **Design System Rules:** Strict Inter typography, 4px baseline spacing rhythm, Primary Blue palette (`#2563EB`), ZERO gradients, flat surfaces, WCAG 2.1 AA contrast.
- **Responsive Architecture:** Desktop/Tablet ($\ge 768$px) renders 7-column Month grid; Mobile ($< 768$px / 390px) automatically reflows to an Agenda/Date-grouped list view to prevent broken miniature cells.

---

## Review Focus

1. **Timezone consistency:** ISO UTC strings (`yyyy-MM-ddTHH:mm:ss.sssZ`) must be parsed and mapped using `date-fns` local calendar dates without off-by-one day shifts.
2. **Dateless cards handling:** Cards with `dueDate: null` and `startDate: null` must be filtered cleanly without producing `Invalid Date` or crashing the day cells.
3. **Day cell overflow ($> 2$ cards):** Cells with multiple cards must show the first 2 items and a clean `+N more` button that opens an accessible day overview popover/dialog.
4. **CardDetailDrawer synchronicity:** Updating a card's title, priority, status, or due date inside `CardDetailDrawer` while in Calendar view must instantly reflect in the calendar cells upon commit.
5. **Mobile 390px layout stability:** The mobile Agenda view must stack dates, cards, and metadata cleanly with zero horizontal scrollbar or clipping.

---

## File Structure

```text
src/
├── components/
│   └── kanban/
│       ├── calendar/
│       │   ├── calendar.utils.ts           # Pure date calculation, grid generation & card mapping
│       │   ├── CalendarCardChip.tsx        # Compact card chip with status dot, code, title, priority
│       │   ├── CalendarDayCell.tsx         # Individual day cell, today highlight, card chips, +N more popover
│       │   ├── CalendarMonthView.tsx       # 7-column weekday headers & 5-6 week rows
│       │   ├── CalendarAgendaView.tsx      # Mobile date-grouped list view (< 768px)
│       │   ├── CalendarToolbar.tsx         # Month navigation, Today button, Month/Agenda toggle
│       │   ├── BoardCalendar.tsx           # Master Calendar container combining toolbar & active view
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

  export function getCalendarMonthDays(currentDate: Date, cards: KanbanCard[]): CalendarDay[];
  export function getAgendaGroups(currentDate: Date, cards: KanbanCard[]): { date: Date; dateString: string; cards: KanbanCard[] }[];
  export function getUnscheduledCards(cards: KanbanCard[]): KanbanCard[];
  export function formatPeriodTitle(currentDate: Date): string;
  ```

- [ ] **Step 1: Write the failing test for `calendar.utils.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getCalendarMonthDays, getUnscheduledCards, formatPeriodTitle } from "../calendar.utils";
import type { KanbanCard } from "@/types";

describe("calendar.utils", () => {
  const mockCards: KanbanCard[] = [
    {
      id: "c-1",
      listId: "l-1",
      boardId: "b-1",
      code: "NEX-101",
      title: "Landing page",
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
    },
    {
      id: "c-2",
      listId: "l-1",
      boardId: "b-1",
      code: "NEX-102",
      title: "Dateless task",
      priority: "LOW",
      position: 2048,
      status: "ACTIVE",
      dueDate: null,
      assignees: [],
      labels: [],
      tasksCount: 0,
      completedTasksCount: 0,
      updatedAt: "2026-09-20T00:00:00.000Z",
      createdAt: "2026-09-15T00:00:00.000Z",
    },
  ];

  it("generates complete 35 or 42 day month grid for given date", () => {
    const days = getCalendarMonthDays(new Date("2026-09-15T00:00:00"), mockCards);
    expect(days.length % 7).toBe(0);
    expect(days.length).toBeGreaterThanOrEqual(35);
  });

  it("maps cards to their due date cell", () => {
    const days = getCalendarMonthDays(new Date("2026-09-15T00:00:00"), mockCards);
    const sep28 = days.find((d) => d.dateString === "2026-09-28");
    expect(sep28).toBeDefined();
    expect(sep28?.cards.some((c) => c.code === "NEX-101")).toBe(true);
  });

  it("identifies unscheduled cards without dates", () => {
    const unscheduled = getUnscheduledCards(mockCards);
    expect(unscheduled.length).toBe(1);
    expect(unscheduled[0].code).toBe("NEX-102");
  });

  it("formats month period title", () => {
    const title = formatPeriodTitle(new Date("2026-09-15T00:00:00"));
    expect(title).toBe("September 2026");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/calendar.utils.test.ts`
Expected: FAIL with missing module `calendar.utils.ts`

- [ ] **Step 3: Implement `calendar.utils.ts`**

Use `date-fns` functions (`startOfMonth`, `endOfMonth`, `startOfWeek`, `endOfWeek`, `eachDayOfInterval`, `format`, `isSameMonth`, `isToday`, `parseISO`) to generate the grid with Monday start-of-week (`{ weekStartsOn: 1 }`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/kanban/calendar/__tests__/calendar.utils.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/calendar.utils.ts src/components/kanban/calendar/__tests__/calendar.utils.test.ts
git commit -m "feat(calendar): add calendar date derivation and utility helpers"
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
    compact?: boolean;
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
    date: new Date("2026-09-28T00:00:00"),
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

  it("renders +1 more overflow button and triggers popover", () => {
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
  - Semantic status dot (TODO: neutral, IN_PROGRESS: primary-500, DONE: emerald-500).
  - Code badge (`NEX-101`) + truncated Title + priority indicator.
  - Hover background `#F3F4F6`, focus outline ring.
  - Accessible name: `${card.code} - ${card.title} - Priority: ${card.priority}`.
- `CalendarDayCell`:
  - Date number header (with blue circle badge if `isToday === true`).
  - Muted gray background for `isCurrentMonth === false`.
  - Display first 2 cards; if `day.cards.length > 2`, display `+${day.cards.length - 2} more` button opening Radix Dialog / Popover listing all cards for that date.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarDayCell.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/CalendarCardChip.tsx src/components/kanban/calendar/CalendarDayCell.tsx src/components/kanban/calendar/__tests__/CalendarDayCell.test.tsx
git commit -m "feat(calendar): implement calendar card chip and day cell with overflow"
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
    viewMode: "month" | "agenda";
    onViewModeChange: (mode: "month" | "agenda") => void;
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
  it("renders 7 weekday headers from Mon to Sun", () => {
    const days = getCalendarMonthDays(new Date("2026-09-15T00:00:00"), []);
    render(<CalendarMonthView days={days} onCardClick={vi.fn()} />);

    expect(screen.getByText("Mon")).toBeDefined();
    expect(screen.getByText("Tue")).toBeDefined();
    expect(screen.getByText("Wed")).toBeDefined();
    expect(screen.getByText("Thu")).toBeDefined();
    expect(screen.getByText("Fri")).toBeDefined();
    expect(screen.getByText("Sat")).toBeDefined();
    expect(screen.getByText("Sun")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarMonthView.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `CalendarToolbar.tsx` and `CalendarMonthView.tsx`**

- `CalendarToolbar`:
  - Period title (`September 2026`).
  - ChevronLeft (`aria-label="Previous month"`), ChevronRight (`aria-label="Next month"`), Today button (`aria-label="Jump to current date"`).
  - Unscheduled cards counter badge (`N unscheduled`).
  - Month / Agenda view mode buttons (`hidden sm:inline-flex`).
- `CalendarMonthView`:
  - 7 column headers: Mon, Tue, Wed, Thu, Fri, Sat, Sun.
  - Responsive grid: `grid grid-cols-7 border border-neutral-200 rounded-xl overflow-hidden bg-neutral-200 gap-px`.
  - Cell minimum height: `min-h-[105px] sm:min-h-[120px]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/components/kanban/calendar/__tests__/CalendarMonthView.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/kanban/calendar/CalendarToolbar.tsx src/components/kanban/calendar/CalendarMonthView.tsx src/components/kanban/calendar/__tests__/CalendarMonthView.test.tsx
git commit -m "feat(calendar): implement calendar toolbar and 7-column month view"
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

  it("renders scheduled cards grouped by date", () => {
    const handleCardClick = vi.fn();
    render(
      <CalendarAgendaView
        currentDate={new Date("2026-09-15T00:00:00")}
        cards={[card]}
        onCardClick={handleCardClick}
      />
    );

    expect(screen.getByText("Mobile test card")).toBeDefined();
    expect(screen.getByText(/Sep 28/i)).toBeDefined();
  });

  it("renders clean empty state if no cards scheduled in period", () => {
    render(
      <CalendarAgendaView
        currentDate={new Date("2026-09-15T00:00:00")}
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

- Filters and sorts cards with `dueDate` or `startDate` within current month.
- Groups by calendar day formatted nicely (`Monday, Sep 28`).
- Renders full-width touch-friendly card rows with `CalendarCardChip`.
- If zero scheduled cards, renders intentional empty state:
  > **No scheduled work**
  > There are no cards with dates in this period.

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
- Test: `src/pages/boards/__tests__/BoardDetailPage.calendar.test.tsx`

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
  it("renders calendar toolbar and month grid", () => {
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

  it("navigates months when clicking next and prev buttons", () => {
    render(
      <BoardCalendar
        lists={MOCK_BOARD_DETAIL.lists}
        onCardClick={vi.fn()}
      />
    );

    const nextBtn = screen.getByRole("button", { name: /Next month/i });
    fireEvent.click(nextBtn);

    // Month changes
    const todayBtn = screen.getByRole("button", { name: /Jump to current date/i });
    fireEvent.click(todayBtn);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/components/kanban/calendar/__tests__/BoardCalendar.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `BoardCalendar.tsx` and integrate into `BoardDetailPage.tsx`**

- `BoardCalendar.tsx`:
  - Maintains `currentDate` state (initialized to current date, or anchor date of board).
  - Maintains responsive `viewMode: "month" | "agenda"`. Automatically switches to `agenda` on mobile screens `< 768px` using `useMediaQuery` or responsive CSS wrapper.
  - Derives all cards by flattening `lists.flatMap(l => l.cards)`.
  - Connects `CalendarToolbar` with `CalendarMonthView` and `CalendarAgendaView`.
- In `src/pages/boards/BoardDetailPage.tsx`:
  - Replace lines 128-145 (the calendar placeholder box) with:
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

**Files:**
- Test all modified and new files

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

- [ ] **Step 6: Final Commit**
```bash
git commit --allow-empty -m "chore(planning): verify board calendar view quality gates"
```
