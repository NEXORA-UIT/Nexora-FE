# Nexora GSAP UI & Motion Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Nexora frontend with silky-smooth GSAP animations matching the quality of the ORBIT demo (choreographed page entrance, gentle coordinate parallax, scroll reveals, tactile hover feedback), while strictly preserving Nexora's brand identity, Zero-Gradient rule, and sub-500ms enterprise performance.

**Architecture:** A lightweight motion layer built with `gsap`, `@gsap/react`, and `ScrollTrigger` centered in `src/lib/motion/`. All animations are component-scoped via `useGSAP`, strictly avoid layout thrashing (GPU-accelerated `transform` and `opacity` only), support instant bypass for `prefers-reduced-motion`, and run with an enterprise-grade timing budget (0.3s–0.5s, `once: true` on scroll).

**Tech Stack:** React 18.3, TypeScript 5.7, Tailwind CSS 3.4, GSAP 3.x, @gsap/react 2.x, Vitest, Testing Library.

**Spec:** Brainstormed & user-approved design specification:
- Style: Subtle & High-Performance Enterprise (Pacing: 0.3s - 0.5s, Easing: `power3.out` / `expo.out`, Parallax: 15px - 30px).
- Scope: Full Journey (Landing Page master choreography + In-App smooth non-blocking transitions on `HomePage` & `BoardDetailPage`).
- Mockup Kanban: Live collaborative cursors via GSAP timelines + tactile card hover micro-interactions.
- ScrollTrigger: `once: true` on viewport entry (no distracting repeat animations on re-scroll).
- Constraints: Zero Gradient rule (solid colors only), Inter font, primary `#2563EB`, zero drag-and-drop interference.

---

## Global Constraints

- **Zero-Gradient Rule:** Strictly forbidden to use `linear-gradient` or `radial-gradient` for content/surfaces. Solid colors only (`#FFFFFF`, `#F8FAFC`, `#0A0F1D`, etc.).
- **Typography & Scale:** Inter font family only; 4px baseline spacing scale.
- **Performance Budget:** Animate only `transform` (`x`, `y`, `scale`, `rotation`, `xPercent`, `yPercent`) and `opacity`. No animating layout properties (`width`, `height`, `margin`, `padding`, `top`, `left`, `filter`).
- **Accessibility:** Must support `prefers-reduced-motion: reduce` seamlessly. When enabled, elements render immediately at target state with zero animation delay.
- **Resource Management:** Every GSAP tween and ScrollTrigger must be component-scoped using `@gsap/react` `useGSAP` or properly cleaned up on unmount.
- **Functional Integrity:** All forms, buttons, navigations, drag-and-drop operations, and existing tests must remain 100% operational.

## Review Focus

1. **Reduced Motion Compliance:** Verify that when `prefers-reduced-motion: reduce` is active, no transform transitions or entrance delays occur, and all content is immediately visible.
2. **Drag-and-Drop Non-Interference:** In `BoardDetailPage`, ensure GSAP animations only fire on mount/transition and never attach persistent transform styles to cards or columns that conflict with `@hello-pangea/dnd`.
3. **No Memory Leaks / Orphaned Triggers:** When navigating between routes (`/` -> `/home` -> `/boards/:id`), ScrollTrigger instances and active timelines must be completely killed on unmount.
4. **Zero Layout Shifts (CLS):** Hero and section heights must not shift or jump during entrance sequences.
5. **Type Safety & Build Integrity:** `npm run typecheck` and `npm run lint` must pass cleanly without any TypeScript errors.

---

### Task 1: Motion Infrastructure & Dependency Setup

**Files:**
- Modify: `Frontend/package.json`
- Create: `Frontend/src/lib/motion/index.ts`
- Create: `Frontend/src/lib/motion/gsap.ts`
- Create: `Frontend/src/lib/motion/presets.ts`
- Create: `Frontend/src/lib/motion/__tests__/motion.test.ts`

- [ ] **Step 1: Install GSAP and @gsap/react**
  Run: `npm --prefix Frontend install gsap @gsap/react`
  Verify packages appear in `Frontend/package.json` dependencies.

- [ ] **Step 2: Create Core GSAP Initializer & Plugin Registration**
  Implement `Frontend/src/lib/motion/gsap.ts`:
  - Import `gsap` and `ScrollTrigger`.
  - Register `ScrollTrigger` with `gsap.registerPlugin(ScrollTrigger)`.
  - Export configured `gsap`, `ScrollTrigger`, and standard easing constants (`EASE_ENTER = "power3.out"`, `EASE_DECEL = "expo.out"`).

- [ ] **Step 3: Create Reusable Motion Presets & Accessibility Helper**
  Implement `Frontend/src/lib/motion/presets.ts`:
  - `isReducedMotion()` helper checking `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
  - Presets for standard enterprise animations:
    - `fadeInUp(element, options)`
    - `staggerList(elements, options)`
    - `counterRoll(element, targetValue, duration)`
  - Barrel export in `Frontend/src/lib/motion/index.ts`.

- [ ] **Step 4: Write Unit Tests for Motion Infrastructure**
  Create `Frontend/src/lib/motion/__tests__/motion.test.ts` verifying:
  - Plugin registration executes without error.
  - `isReducedMotion()` handles both window present and undefined (SSR-safe).
  - Presets return valid GSAP tween configurations.

- [ ] **Step 5: Verify Typecheck & Tests**
  Run: `npm --prefix Frontend run typecheck`
  Run: `npm --prefix Frontend test -- src/lib/motion/__tests__/motion.test.ts --run`

---

### Task 2: Landing Page Hero & Mockup Kanban Board Choreography

**Files:**
- Modify: `Frontend/src/components/landing/LandingHero.tsx`
- Modify: `Frontend/src/components/landing/MockKanbanBoard.tsx`

- [ ] **Step 1: Orchestrate Landing Hero Entrance Timeline**
  Update `LandingHero.tsx` using `useGSAP`:
  - Target container ref `heroRef`.
  - Sequence timeline with `EASE_ENTER` (duration 0.4s):
    1. Split headline lines reveal (`y: 16 -> 0`, `opacity: 0 -> 1`).
    2. Sub-copy fade in (`y: 10 -> 0`, `opacity: 0 -> 1`).
    3. Quick sign-up form and OAuth buttons slide up (`y: 12 -> 0`, `opacity: 0 -> 1`).
    4. MockKanbanBoard wrapper smoothly expands and settles.

- [ ] **Step 2: Upgrade MockKanbanBoard with Staggered Cascades & Tactile Interactions**
  Update `MockKanbanBoard.tsx` using `useGSAP`:
  - Column cascade: columns reveal with `stagger: 0.04s` (`y: 20 -> 0`, `opacity: 0 -> 1`).
  - Cards inside columns have subtle hover feedback: `transform: translateY(-3px)` and border focus.
  - Implement smooth simulated live collaboration cursors ("Clara Chen" and "Alex Morgan") animated on an organic loop path with subtle cursor click/hover state simulation.
  - Add delicate 3D perspective mouse-tracking tilt to the board container (max tilt ±1.5deg with damped `quickTo` for ultra-smooth responsiveness).

- [ ] **Step 3: Verify Reduced Motion in Hero & Mockup Board**
  Confirm that when `prefers-reduced-motion: reduce` is detected, all elements appear immediately with full opacity and zero transform offsets.

- [ ] **Step 4: Verify Typecheck & Build**
  Run: `npm --prefix Frontend run typecheck`

---

### Task 3: Landing Page ScrollTrigger Sections (AI Dark, Bento Grid, Stats)

**Files:**
- Modify: `Frontend/src/components/landing/LandingAiDarkSection.tsx`
- Modify: `Frontend/src/components/landing/LandingBentoGrid.tsx`
- Modify: `Frontend/src/components/landing/LandingStatsAndQuotes.tsx`

- [ ] **Step 1: AI Capabilities Dark Section Scroll Reveal & Subtle Grid Parallax**
  Update `LandingAiDarkSection.tsx`:
  - Dot-grid background subtle coordinate parallax (`y: -24px` over scroll range).
  - Section heading & 3 high-contrast cards reveal via `ScrollTrigger` with `once: true`, `start: "top 80%"` and `stagger: 0.08s`.
  - Glowing indicator badge pulse effect.

- [ ] **Step 2: Architectural Bento Grid Scroll Trigger**
  Update `LandingBentoGrid.tsx`:
  - Main header and 4 Bento cards reveal via `ScrollTrigger` with `once: true`.
  - Workflow pipeline node diagram: animate subtle connection flow / data packet markers along pipeline nodes.

- [ ] **Step 3: Stats & Metrics Number Rollup**
  Update `LandingStatsAndQuotes.tsx`:
  - Animate key metric numbers (e.g. 99.9%, 40%, 10k+) rolling up smoothly to target values upon entering viewport using `counterRoll`.

- [ ] **Step 4: Verify Clean Unmount & ScrollTrigger Cleanup**
  Ensure all `ScrollTrigger` instances created in these sections automatically kill when leaving `LandingPage`.

- [ ] **Step 5: Verify Typecheck**
  Run: `npm --prefix Frontend run typecheck`

---

### Task 4: In-App Fast Subtle Transitions (HomePage & BoardDetailPage)

**Files:**
- Modify: `Frontend/src/pages/HomePage.tsx`
- Modify: `Frontend/src/components/dashboard/HomeGreeting.tsx`
- Modify: `Frontend/src/components/boards/BoardCard.tsx`
- Modify: `Frontend/src/pages/boards/BoardDetailPage.tsx`

- [ ] **Step 1: Smooth In-App Dashboard Entrance**
  Update `HomePage.tsx` and `HomeGreeting.tsx`:
  - Smooth page mount transition (`opacity: 0 -> 1, y: 8 -> 0`, duration 0.25s, `EASE_ENTER`).
  - Zero delay for interactive buttons.

- [ ] **Step 2: Tactile Board Card Hover States**
  Update `BoardCard.tsx`:
  - Refined hover lift (`y: -2px`, subtle border `#2563EB` tint).

- [ ] **Step 3: Fast Column Cascade in BoardDetailPage**
  Update `BoardDetailPage.tsx`:
  - On board data load, columns render with a lightning-fast stagger (`0.02s` per column, `y: 10 -> 0`, duration 0.2s).
  - Strictly non-intrusive: no lingering transform styles that could conflict with `@hello-pangea/dnd` dragging.

- [ ] **Step 4: Verify Drag-and-Drop & Board Interaction Integrity**
  Confirm board drag-and-drop, card modal opening, and drawer operations function with zero interference.

---

### Task 5: Verification, Accessibility Audit & Delivery

**Files:**
- Verification only

- [ ] **Step 1: Full TypeScript & Lint Verification**
  Run: `npm --prefix Frontend run typecheck`
  Run: `npm --prefix Frontend run lint`

- [ ] **Step 2: Run Frontend Test Suite**
  Run: `npm --prefix Frontend test -- --run`
  Verify all 604+ tests pass and no new regressions are introduced.

- [ ] **Step 3: Manual Visual & Interaction Verification in Browser**
  - Start preview or dev server: `npm --prefix Frontend run dev`
  - Verify Landing Hero entrance, cursor movement, card hover, ScrollTrigger sections, and In-App navigation.
  - Toggle `prefers-reduced-motion` in browser emulation to verify zero-motion fallback.

- [ ] **Step 4: Prepare Final Delivery Report**
  Report branch `codex/nexora-gsap-ui`, modified files, verification results, and preview instructions.
