# Comprehensive Mobile-First UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-grade, touch-optimized mobile experience across Nexora, providing complete mobile workspace navigation, scroll-snap Kanban column carousels with column selector pills, tap-to-move card actions, mobile bottom sheets for dialogs, and responsive agenda calendar views.

**Architecture:** Implement a modular mobile UX layer that dynamically adapts when screen width `< 768px` (mobile). A slide-over `MobileNavDrawer` unlocks workspace switching and deep routes; CSS scroll-snap with segmented pills powers the mobile Kanban canvas; dialogs adapt seamlessly into bottom sheets via responsive Radix dialog styling.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, GSAP (@gsap/react), Radix UI Dialog & Dropdown primitives, Lucide React icons, Vitest, Playwright.

**Spec:** `Frontend/docs/superpowers/specs/2026-11-07-mobile-comprehensive-ux-design.md`

## Global Constraints

- **Design System:** Strict Inter font, primary `#2563EB`, neutral backgrounds (`#F8FAFC`, `#0F172A`).
- **Zero-Gradient Rule:** Strictly forbidden to use `linear-gradient` or `radial-gradient` on UI buttons, drawers, cards, or dialog surfaces.
- **Mobile Touch Usability:** Minimum 44px tap targets for interactive buttons, 16px minimum text size on input fields to prevent iOS viewport auto-zoom.
- **Performance:** 60fps GPU acceleration using `transform` (`x`, `y`, `scale`) and `opacity`. No layout thrashing or unoptimized scroll listeners.
- **Safe Area Insets:** All fixed bottom elements (bottom nav, bottom sheets, drawer footers) must include `pb-[env(safe-area-inset-bottom)]`.
- **Branch & Safety:** Work strictly inside `Frontend/` on branch `codex/nexora-gsap-ui`. Do not commit directly to `main` or `staging`.

## Review Focus

1. **Virtual Keyboard Collision:** On mobile devices, opening an input inside a bottom sheet or drawer must not push action buttons off-screen or trap scroll.
2. **Touch Drag vs Scroll Conflicts:** Swiping on the Kanban board must not accidentally initiate an unintended card drag or reorder.
3. **Workspace Switching Isolation:** Switching workspaces from the `MobileNavDrawer` must reset active board context and update the UI immediately without requiring a page reload.
4. **Safe Area Clipping:** On notched phones (iPhone X through 16), bottom sheets and bottom navigation items must remain accessible above the home indicator bar.
5. **Reduced Motion Compliance:** Respect `isReducedMotion()` on all mobile slide-over drawers and column pill transitions.

---

## Tasks

### Task 1: Mobile Navigation Drawer & Workspace Switcher

**Files:**
- Create: `Frontend/src/components/navigation/MobileNavDrawer.tsx`
- Modify: `Frontend/src/components/navigation/Topbar.tsx`
- Modify: `Frontend/src/components/navigation/index.ts`
- Test: `Frontend/src/components/navigation/__tests__/MobileNavDrawer.test.tsx`

**Interfaces:**
- Consumes: `useWorkspaceStore`, `useAuthStore`, `ROUTES`, `DialogPrimitive` from `@radix-ui/react-dialog`.
- Produces: `<MobileNavDrawer isOpen={boolean} onClose={() => void} />` component and mobile trigger button in `Topbar.tsx`.

- [ ] **Step 1: Write the failing test for `MobileNavDrawer`**

```tsx
// Frontend/src/components/navigation/__tests__/MobileNavDrawer.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MobileNavDrawer } from "../MobileNavDrawer";

describe("MobileNavDrawer", () => {
  it("renders workspace selector and navigation links when open", () => {
    render(
      <MemoryRouter>
        <MobileNavDrawer isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Workspaces")).toBeDefined();
    expect(screen.getByText("Knowledge Base")).toBeDefined();
    expect(screen.getByText("Help & Guides")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Frontend; npm test -- src/components/navigation/__tests__/MobileNavDrawer.test.tsx --run`
Expected: FAIL with "Cannot find module '../MobileNavDrawer'"

- [ ] **Step 3: Implement `MobileNavDrawer.tsx` and integrate trigger into `Topbar.tsx`**

Implement `MobileNavDrawer` as a slide-over sheet from the left:
- Accessible header with Workspace switcher and active workspace indicator.
- List of boards in the active workspace.
- Secondary links not present in bottom bar: *Knowledge Base*, *Help*, *Settings*, *Workspace Members*.
- Logout button with confirm dialog.
- Update `Topbar.tsx` to add a hamburger/workspace menu button (`md:hidden`) that toggles `isDrawerOpen`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Frontend; npm test -- src/components/navigation/__tests__/MobileNavDrawer.test.tsx --run`
Expected: PASS

- [ ] **Step 5: Verify build & TypeScript**

Run: `cd Frontend; npx tsc -p tsconfig.app.json`
Expected: 0 errors

---

### Task 2: Responsive Modal Bottom Sheet Adapter

**Files:**
- Modify: `Frontend/src/components/ui/dialog.tsx`
- Test: `Frontend/src/components/ui/__tests__/dialog.responsive.test.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-dialog`.
- Produces: Enhanced `DialogContent` with mobile bottom sheet styling (`sm:rounded-2xl` on desktop, `rounded-t-2xl fixed inset-x-0 bottom-0` on mobile `< sm`).

- [ ] **Step 1: Write test for responsive dialog sheet classes**

```tsx
// Frontend/src/components/ui/__tests__/dialog.responsive.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DialogRoot, DialogContent } from "../dialog";

describe("DialogContent responsive behavior", () => {
  it("includes mobile bottom-sheet styling rules", () => {
    render(
      <DialogRoot open={true}>
        <DialogContent size="md">
          <div>Dialog Content</div>
        </DialogContent>
      </DialogRoot>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("max-sm:bottom-0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Frontend; npm test -- src/components/ui/__tests__/dialog.responsive.test.tsx --run`
Expected: FAIL (class not present)

- [ ] **Step 3: Update `Frontend/src/components/ui/dialog.tsx`**

Add mobile bottom-sheet classes to non-drawer dialogs:
- On screens `< sm`: `max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-x-0 max-sm:translate-y-0 max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:max-h-[90dvh] max-sm:pb-[env(safe-area-inset-bottom)]`.
- Add visual grab handle: `<div className="mx-auto my-2 h-1.5 w-10 shrink-0 rounded-full bg-neutral-300 sm:hidden" />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Frontend; npm test -- src/components/ui/__tests__/dialog.responsive.test.tsx --run`
Expected: PASS

---

### Task 3: Touch-First Mobile Kanban Carousel with Segmented Column Pills

**Files:**
- Create: `Frontend/src/components/kanban/MobileColumnSelector.tsx`
- Modify: `Frontend/src/components/kanban/KanbanBoard.tsx`
- Modify: `Frontend/src/components/kanban/KanbanColumn.tsx`
- Modify: `Frontend/src/components/kanban/KanbanCard.tsx`
- Test: `Frontend/src/components/kanban/__tests__/MobileKanban.test.tsx`

**Interfaces:**
- Consumes: `KanbanList`, `KanbanCard`, `MoveCardInput`, `useKanbanDnd`.
- Produces:
  - `<MobileColumnSelector lists={lists} activeListId={string} onSelect={(id: string) => void} />`
  - Mobile snap carousel with tap-to-move quick actions on `KanbanCard`.

- [ ] **Step 1: Write failing test for `MobileColumnSelector`**

```tsx
// Frontend/src/components/kanban/__tests__/MobileKanban.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileColumnSelector } from "../MobileColumnSelector";

describe("MobileColumnSelector", () => {
  const mockLists = [
    { id: "col-1", name: "To Do", cards: [{ id: "c1" }] },
    { id: "col-2", name: "In Progress", cards: [] },
  ] as any;

  it("renders list pills with card count and notifies on selection", () => {
    const handleSelect = vi.fn();
    render(
      <MobileColumnSelector
        lists={mockLists}
        activeListId="col-1"
        onSelect={handleSelect}
      />
    );

    expect(screen.getByText("To Do")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
    fireEvent.click(screen.getByText("In Progress"));
    expect(handleSelect).toHaveBeenCalledWith("col-2");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Frontend; npm test -- src/components/kanban/__tests__/MobileKanban.test.tsx --run`
Expected: FAIL

- [ ] **Step 3: Implement `MobileColumnSelector.tsx` and integrate into `KanbanBoard.tsx`**

- `MobileColumnSelector.tsx`:
  - Renders a horizontal scroll container of pills (`sm:hidden`).
  - Active pill gets `bg-primary-600 text-white font-semibold shadow-xs`.
  - Inactive pills get `bg-neutral-100 text-neutral-600 hover:text-neutral-900`.
- In `KanbanBoard.tsx`:
  - Add `activeListId` state.
  - Set board container classes: `snap-x snap-mandatory` on mobile, smooth scrolling to column on pill click.
- In `KanbanColumn.tsx`:
  - Column width responsive: `w-[calc(100vw-2.5rem)] min-w-[calc(100vw-2.5rem)] max-w-sm shrink-0 snap-center sm:w-[320px] sm:min-w-[320px]`.
- In `KanbanCard.tsx`:
  - Add a lightweight quick "Move" menu button on mobile (`sm:hidden`) with dropdown options to move card directly into other lists, eliminating touch drag friction.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Frontend; npm test -- src/components/kanban/__tests__/MobileKanban.test.tsx --run`
Expected: PASS

---

### Task 4: Responsive Mobile Board Header & Toolbar

**Files:**
- Modify: `Frontend/src/components/kanban/BoardDetailHeader.tsx`
- Modify: `Frontend/src/components/kanban/BoardDetailToolbar.tsx`
- Test: `Frontend/src/components/kanban/__tests__/BoardDetailToolbar.mobile.test.tsx`

**Interfaces:**
- Consumes: `BoardDetailHeaderProps`, `BoardDetailToolbarProps`.
- Produces: Collapsed touch-friendly header and compact single-row toolbar on mobile screens.

- [ ] **Step 1: Write test for mobile board toolbar compact controls**

```tsx
// Frontend/src/components/kanban/__tests__/BoardDetailToolbar.mobile.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoardDetailToolbar } from "../BoardDetailToolbar";

describe("BoardDetailToolbar mobile responsiveness", () => {
  it("renders compact controls and accessible view buttons", () => {
    render(
      <BoardDetailToolbar
        activeView="board"
        onViewChange={vi.fn()}
        backgroundPreset="white"
        onBackgroundChange={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        filters={{ priority: "ALL", status: "ALL", labels: [], assignees: [], isOverdue: false }}
        onFiltersChange={vi.fn()}
        members={[]}
        labels={[]}
      />
    );

    expect(screen.getByRole("button", { name: /board/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /calendar/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /planning/i })).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it passes/fails**

Run: `cd Frontend; npm test -- src/components/kanban/__tests__/BoardDetailToolbar.mobile.test.tsx --run`

- [ ] **Step 3: Update `BoardDetailHeader.tsx` & `BoardDetailToolbar.tsx`**

- In `BoardDetailHeader.tsx`:
  - On mobile (`< sm`), hide long description behind a collapsible toggle or compact line clamp.
  - Consolidate secondary buttons into a single `...` dropdown menu.
- In `BoardDetailToolbar.tsx`:
  - Wrap toolbar in a single responsive flex row on mobile.
  - Background selector and archived list count collapse into compact touch buttons.
  - View switcher text collapses to icon-only on very narrow screens (`< 380px`) with full `aria-label`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Frontend; npm test -- src/components/kanban/__tests__/BoardDetailToolbar.mobile.test.tsx --run`
Expected: PASS

---

### Task 5: Mobile Agenda List for Calendar & Planning Views

**Files:**
- Create: `Frontend/src/components/kanban/calendar/MobileAgendaList.tsx`
- Modify: `Frontend/src/components/kanban/calendar/BoardCalendar.tsx`
- Test: `Frontend/src/components/kanban/calendar/__tests__/MobileAgendaList.test.tsx`

**Interfaces:**
- Consumes: `KanbanList[]`, `onCardClick: (card: KanbanCard) => void`.
- Produces: Touch-friendly vertical Agenda List grouping cards by date and overdue status.

- [ ] **Step 1: Write test for `MobileAgendaList`**

```tsx
// Frontend/src/components/kanban/calendar/__tests__/MobileAgendaList.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileAgendaList } from "../MobileAgendaList";

describe("MobileAgendaList", () => {
  const lists = [
    {
      id: "l1",
      name: "To Do",
      cards: [
        { id: "c1", code: "NEX-1", title: "Setup auth", dueDate: "2026-11-10", priority: "HIGH" },
      ],
    },
  ] as any;

  it("renders scheduled cards in agenda order and handles click", () => {
    const handleClick = vi.fn();
    render(<MobileAgendaList lists={lists} onCardClick={handleClick} />);

    expect(screen.getByText("Setup auth")).toBeDefined();
    expect(screen.getByText("NEX-1")).toBeDefined();
    fireEvent.click(screen.getByText("Setup auth"));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Frontend; npm test -- src/components/kanban/calendar/__tests__/MobileAgendaList.test.tsx --run`
Expected: FAIL

- [ ] **Step 3: Implement `MobileAgendaList.tsx` and integrate into `BoardCalendar.tsx`**

- Group cards into: *Today*, *Upcoming this week*, *Later*, and *No due date*.
- Display date chip, priority badge, and card title with 48px touch row.
- In `BoardCalendar.tsx`, automatically display `MobileAgendaList` on mobile screens (`md:hidden`) with a toggle button to switch to Month Grid if desired.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Frontend; npm test -- src/components/kanban/calendar/__tests__/MobileAgendaList.test.tsx --run`
Expected: PASS

---

### Task 6: Comprehensive Verification & Visual Inspection

**Files:**
- Create: `C:\Users\ADMIN\.gemini\antigravity\brain\8eab5ed1-fc0a-4fae-97c5-1a984e684a86\scratch\verify_mobile_e2e.js`
- Screenshots generated in: `C:\Users\ADMIN\.gemini\antigravity\brain\8eab5ed1-fc0a-4fae-97c5-1a984e684a86\screenshots/`

- [ ] **Step 1: Run TypeScript compiler check**

Run: `cd Frontend; npx tsc -p tsconfig.app.json`
Expected: 0 errors

- [ ] **Step 2: Run linter**

Run: `cd Frontend; npm run lint`
Expected: 0 errors

- [ ] **Step 3: Run full automated test suite**

Run: `cd Frontend; npm test -- --run`
Expected: All tests pass

- [ ] **Step 4: Run Playwright headless browser check on mobile viewports**

Capture screenshots for:
1. Mobile Navigation Drawer (`mobile_nav_drawer.png` on 375x812)
2. Mobile Kanban Board with Column Pills (`mobile_kanban_pills.png` on 390x844)
3. Mobile Board Bottom Sheet Dialog (`mobile_bottom_sheet.png` on 375x812)
4. Mobile Agenda Calendar View (`mobile_agenda_calendar.png` on 390x844)
Verify layout stability, no horizontal overflow, and crisp touch targets.

- [ ] **Step 5: Run production build**

Run: `cd Frontend; npm run build`
Expected: Exit code 0
