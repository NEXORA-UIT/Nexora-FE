# Nexora Dialog and Modal Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the FE's 12 dialog/drawer flows a consistent, responsive, keyboard-accessible frame while keeping their existing product behavior.

**Architecture:** Add a small shared Radix Dialog primitive for overlays, centered dialog sizes, headers, scrollable bodies, footers, and the existing right drawer. Migrate each current dialog to this primitive. Split the dense Board members dialog into Access & roles and Members tabs.

**Tech Stack:** React, TypeScript, Tailwind CSS, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-25-modal-experience-design.md`

## Global Constraints

- Keep APIs, schema, authorization, and business behavior unchanged.
- Preserve the Card detail drawer's right-side presentation.
- Follow existing FE design tokens and component patterns.
- Use Radix for dialog focus, Escape handling, modal isolation, and portals.
- Split information into tabs only when independent sections make a dialog hard to scan; Board members is the confirmed case.

## Review Focus

- Narrow viewports: actions remain reachable and body scrolls without clipping; test AppDialog size classes and mobile viewport layout.
- Long content: header and footer remain visible while the content area scrolls; test Board members with a long member list.
- Keyboard use: Escape closes closable dialogs, focus stays in the open dialog and returns to its trigger; test AppDialog with Radix behavior.
- Pending mutations: destructive/save dialogs cannot be dismissed while an action is in progress; test the affected confirmation and form dialogs.
- Layer overlap: background menus and page controls are inert while a dialog is open; test Radix modal isolation on the shared primitive.

## Files to Create or Modify

- Create `src/components/ui/dialog.tsx`: typed shared Radix wrappers for root, trigger, close, content, overlay, title, description, header, body, and footer; content supports `sm`, `md`, `lg`, and `drawer` sizes.
- Create `src/components/ui/__tests__/dialog.test.tsx`: shell rendering, size variants, Escape dismissal, and focus containment/return behavior.
- Modify 12 existing dialog/drawer components listed in the design spec to use the shared shell without changing callbacks or API calls.
- Modify `src/components/kanban/BoardMembersDialog.tsx` and its tests to organize role/access controls and member controls into two tabs.
- Update component tests next to each migrated dialog; retain current tests and assertions for existing behavior.

---

### Task 1: Shared dialog primitive

**Files:** `src/components/ui/dialog.tsx`, `src/components/ui/__tests__/dialog.test.tsx`

- [ ] Write tests for title/description semantics, size variants, Escape close, focus containment and focus restoration.
- [ ] Run `pnpm exec vitest run src/components/ui/__tests__/dialog.test.tsx` and confirm the expected failures before implementation.
- [ ] Implement shared wrappers over Radix Dialog, with `sm`, `md`, `lg`, and `drawer` content sizes; use bounded viewport height, inner scrolling, stable header/footer, reduced-motion-aware transitions, and existing z-index tokens.
- [ ] Run the primitive tests and confirm they pass.

### Task 2: Board members tabs and layout

**Files:** `src/components/kanban/BoardMembersDialog.tsx`, `src/components/kanban/__tests__/BoardMembersDialog.test.tsx`

- [ ] Add tests that Access & roles shows Owner/PM information and PM assignment, while Members shows add/remove controls and the member list.
- [ ] Run the focused test and confirm the new tab assertions fail before implementation.
- [ ] Migrate to the shared dialog; use a compact non-wrapping header action for Copy board link and tabs named `Access & roles` and `Members`.
- [ ] Ensure loading/error/empty states remain in the relevant tab and mutation behavior stays unchanged.
- [ ] Run `pnpm exec vitest run src/components/kanban/__tests__/BoardMembersDialog.test.tsx`.

### Task 3: Workspace and Board forms

**Files:** `src/components/workspace/CreateWorkspaceModal.tsx`, `src/components/boards/CreateBoardModal.tsx`, `src/components/kanban/BoardSettingsDialog.tsx`, `src/components/profile/AvatarSection.tsx`; adjacent tests.

- [ ] Add or update tests for accessible headings, close/cancel behavior, validation errors, pending submit protection, and URL dialog behavior.
- [ ] Run the focused test files and confirm new accessibility/pending assertions fail first.
- [ ] Migrate these forms to the shared dialog header/body/footer and `md` or `sm` size without altering validation or submit callbacks.
- [ ] Run their focused Vitest files.

### Task 4: Board and planning action dialogs

**Files:** `src/components/boards/ConfirmDeleteBoardDialog.tsx`, `src/components/kanban/GitHubConfigModal.tsx`, `src/components/kanban/planning/AddDependencyDialog.tsx`; adjacent tests.

- [ ] Add or update tests for destructive-action pending lock, connector loading/error states, dependency list scrolling, and footer visibility.
- [ ] Run focused tests and confirm newly added expectations fail before the migration.
- [ ] Migrate to shared `sm`/`md` shells and keep each existing API callback, validation rule, and confirmation requirement unchanged.
- [ ] Run their focused Vitest files.

### Task 5: Account, Calendar, and Card dialogs

**Files:** `src/components/navigation/Topbar.tsx`, `src/components/kanban/calendar/CalendarDayCell.tsx`, `src/components/kanban/detail/CardDetailHeader.tsx`, `src/components/kanban/detail/CardDetailDrawer.tsx`; adjacent tests.

- [ ] Add or update tests for Escape, confirmation submit locking, Calendar overflow scrolling, delete-card pending state, and right drawer behavior.
- [ ] Run focused tests and confirm newly added expectations fail before migration.
- [ ] Migrate centered dialogs to shared `sm`/`md` shells and Card detail to the shared `drawer` variant, retaining all existing content and operations.
- [ ] Run focused Vitest files.

### Task 6: Full modal audit and verification

**Files:** all 12 dialog/drawer files and corresponding tests.

- [ ] Inspect every dialog surface for title, description, close action, scroll ownership, footer reachability, responsive width, and overlay stacking.
- [ ] Run all FE tests with `pnpm test`.
- [ ] Run `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, and `pnpm exec prettier --check "src/**/*.{ts,tsx,css,json}"`.
- [ ] Fix any regression and repeat the affected checks.

## Execution Notes

- Work on the current FE branch because it contains the user's in-progress changes from the preceding task; preserve those unrelated edits.
- Do not commit or push as part of this request. The FE working tree already contains unrelated unstaged work, and the user asked for implementation, not a commit.
- Record any necessary deviation from this plan in the final report.
