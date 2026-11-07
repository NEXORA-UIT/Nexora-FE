# Nexora Comprehensive Mobile-First UX Design Spec

**Date:** 2026-11-07  
**Status:** Approved for Planning  
**Target:** Frontend Mobile Experience (Smartphones 375px - 430px & Tablets 768px)  
**Branch:** `codex/nexora-gsap-ui`

---

## 1. Executive Summary & Goals

Nexora's desktop experience is feature-complete with modern GSAP interactions, real-time collaboration, and rich Kanban workflows. However, the in-app mobile experience currently suffers from key friction points:
1. **Inaccessible Navigation:** The desktop sidebar is hidden on `< md` screens; the mobile bottom bar only provides 5 top-level links without any mechanism to switch workspaces, view members, or access Settings/Help/Knowledge Base.
2. **Clunky Kanban Canvas:** Fixed 320px column widths force awkward 2D scrolling, and touch-based drag-and-drop on phones conflicts with vertical scrolling.
3. **Overcrowded Board Header & Toolbar:** Multiple action rows consume over 250px of vertical space before any tasks are visible.
4. **Desktop-Style Dialogs:** Centered modals feel cramped on small viewports and collide with mobile virtual keyboards.

**Goal:** Deliver a best-in-class, touch-first mobile experience comparable to Linear Mobile and Notion Mobile, respecting Nexora's Design System (Inter font, `#2563EB` primary, Zero-Gradient rule, 60fps GPU acceleration).

---

## 2. Architectural Design

### 2.1 Mobile Navigation Architecture
- **Topbar Hamburger / Workspace Trigger:**
  - Add a touch-friendly trigger button (`h-9 w-9 rounded-xl border border-neutral-200/80 bg-white flex items-center justify-center text-neutral-700`) on the left of `Topbar.tsx` when `< md`.
  - Displays the active workspace icon or standard hamburger icon.
- **Slide-over `MobileNavDrawer`:**
  - Slides in smoothly from the left using a Radix UI Sheet / Dialog primitive or lightweight transition.
  - Header: Active Workspace selector with quick switch dropdown or full workspace list.
  - Body:
    - Current Workspace Board quick list with real-time counters.
    - Full navigation links: Home, Boards, My Tasks, Calendar, Quick Notes, Knowledge Base, Help & Documentation.
    - Workspace Members & Role badge.
  - Footer: User profile summary, Settings link, and Log out action.
  - Tap outside or swipe left dismisses the drawer.
- **Mobile Bottom Navigation (`AppLayout.tsx`):**
  - Retains 5 high-frequency items: *Home, Boards, Tasks, Calendar, Notes*.
  - Enhanced with subtle active pill highlight, haptic-style tap scaling (`active:scale-95`), and safe area padding (`pb-[env(safe-area-inset-bottom)]`).

### 2.2 Mobile-First Kanban Board Canvas (`MobileKanbanView`)
- **Segmented Column Sticky Pill Bar:**
  - Positioned directly above the board canvas on mobile screens (`sm:hidden`).
  - Renders horizontal scrolling pills for all lists (e.g. `[To do (4)] [In progress (2)] [Done (5)]`).
  - Active pill highlights with solid blue `#2563EB` background.
  - Tapping an inactive pill automatically smooth-scrolls and snaps the viewport to that column.
- **Touch-Friendly Scroll-Snap Column Carousel:**
  - On mobile screens (`< sm`), columns adopt responsive width: `w-[calc(100vw-2.5rem)] min-w-[calc(100vw-2.5rem)] max-w-sm shrink-0 snap-center`.
  - The board container uses CSS scroll-snapping: `snap-x snap-mandatory overflow-x-auto`.
  - Swiping horizontally snaps effortlessly from one column to the next without accidental card drags.
- **Quick Card Movement Menu (Tap-To-Move):**
  - Instead of forcing touch drag-and-drop (which can be error-prone on 375px screens), each card on mobile includes a quick action menu (`...`) with "Move to..." options (e.g., "Move to In Progress", "Move to Done").
  - Drag-and-drop remains supported for users who prefer it, with touch delay to prevent conflict with scrolling.

### 2.3 Compact Board Header & Toolbar
- **Compact Header:**
  - Collapses board breadcrumb and title into a clean two-line layout on mobile.
  - Live socket connection indicator and member avatar stack truncated to 3 visible avatars + `+N`.
  - Secondary board actions (Archive, Leave board, Settings) consolidated into a single "..." dropdown.
- **Single-Row Mobile Toolbar:**
  - View switcher (Board / Calendar / Planning) renders compact icon-only buttons with accessible labels.
  - Search input starts as an icon button that expands smoothly into a full-width overlay bar when tapped.
  - Background picker and archived lists moved into a secondary mobile sheet or dropdown.

### 2.4 Mobile Bottom Sheets for Dialogs (`ResponsiveSheet`)
- On screens `< sm` (below 640px), modal dialogs automatically render as bottom sheets:
  - Fixed to viewport bottom: `fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[90dvh] overflow-hidden`.
  - Tactile grab handle at the top (`w-10 h-1.5 rounded-full bg-neutral-300 mx-auto my-2.5`).
  - Sticky bottom action buttons with `env(safe-area-inset-bottom)` support.
  - Seamless scrollable body preventing keyboard overlap issues.

### 2.5 Responsive Agenda List for Calendar & Planning
- On mobile (`< md`), `BoardCalendar` defaults to a day-by-day Agenda List view with date groupings, card priority chips, and status badges.
- Users can switch between Agenda List and Month Grid with a single tap.

---

## 3. Design System & Constraints
- **Typography:** Inter, high-contrast headings, 16px minimum on touch inputs to prevent iOS auto-zoom.
- **Color Palette:** `#2563EB` primary, neutral grays `#0F172A`, `#F8FAFC`.
- **Zero-Gradient Rule:** 100% compliant. No linear or radial gradients on UI elements.
- **Pacing & Performance:** Transform and opacity GPU acceleration (`will-change-transform`), 60fps animations.
