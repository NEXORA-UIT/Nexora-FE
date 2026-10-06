# Card / Task Detail Side Panel Implementation Plan (v3 — Production & Contract Refined)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a slide-over Card / Task Detail Side Panel (Drawer) that opens when clicking a Kanban card on `/boards/:boardId`, allowing users to view and edit task metadata, checklist items, dependencies, attachments, and comments without leaving the board context.

**Architecture:** Route-preserving slide-over Drawer using `@radix-ui/react-dialog` with independent vertical scrolling, single-source-of-truth state synchronization via `useBoardDetail`, strict separation between card field updates (`PATCH /cards/{id}`) and status movement (`PATCH /cards/{id}/move`), lazy-loaded activity logs, debounced description autosave with visual status indicators, and OpenAPI 3.0-aligned in-memory mock mutations in `cardApi`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `date-fns`, `lucide-react`, `sonner`.

**Spec:** Visual hierarchy based on the Nexora Figma reference screenshot (`Website Redesign` task `NEX-101`), strictly honoring business logic consistency and backend OpenAPI contracts.

---

## What Changed from Plan v2 to v3

1. **Fixed Blocked-State Business Logic Consistency:**
   - In v2, `NEX-101` erroneously displayed a "Blocked" warning banner despite its sole prerequisite (`NEX-107`) being completed (`DONE`).
   - In v3, a card is blocked (`isBlocked = true`) **if and only if** it has at least one incomplete prerequisite (`isCompleted === false`).
   - `NEX-101`: `NEX-107` is `DONE` (`isCompleted: true`), so `NEX-101` has `isBlocked: false` and displays **no blocked alert banner** in the happy path.
   - `NEX-103`: Designated as the dedicated blocked-card test case with an incomplete prerequisite (`NEX-102` in `IN PROGRESS`). It displays the blocked banner and validates that moving to `DONE` is rejected.
2. **Verified Delete Card Against Backend OpenAPI:**
   - Inspected `Backend/be/docs/api/openapi.yaml` (lines 1426–1448). Confirmed `DELETE /cards/{id}` is formally defined under operation `deleteCard` (`tags: Cards`, `parameters: CardIdPath`, responses `200 EmptySuccessResponse`).
   - Card options dropdown menu (`...`) is strictly restricted to supported actions: `Copy link`, `Delete card`, and `Close panel`. No unsupported or unmapped actions are exposed.
3. **Lazy-Loaded Activity Stream:**
   - Activity audit logs are **not** fetched on drawer opening.
   - Initial drawer open only consumes the card detail.
   - `GET /cards/{id}/activities` is fetched lazily only when the user switches to the `Activity` tab, with loading skeleton feedback and in-session caching.
4. **Refined Description Autosave:**
   - Replaced keystroke updates with a local draft state, a **1000ms debounce timer**, and immediate commit on **blur** (`onBlur`).
   - Section header features a clear visual indicator: `Unsaved changes...` $\rightarrow$ `Saving...` $\rightarrow$ `Auto-saved` (with subtle checkmark).
   - Enforces Optimistic Concurrency Control (`updatedAt`) on every commit.
5. **Maintained All Approved Core Architecture:**
   - Slide-over Drawer overlay on `/boards/:boardId` (no separate `/tasks/:taskId` route).
   - Status changes strictly invoke `cardApi.moveCard()`, never `updateCard({ status })`.
   - `UpdateCardInput` strictly mirrors OpenAPI `UpdateCardRequest`.
   - 7px drag threshold and horizontal canvas panning remain 100% regression-free.
   - Zero gradients, 4px baseline rhythm, Nexora blue design system.

---

## 1. Current Architecture & OpenAPI Verification

### OpenAPI Verification Summary (`Backend/be/docs/api/openapi.yaml`)

| Operation | Line in OpenAPI | Path | HTTP Method | Contract Status |
| :--- | :--- | :--- | :--- | :--- |
| `getCardById` | 1361 | `/cards/{id}` | `GET` | **Verified**: Returns `CardDetailResponse` |
| `updateCard` | 1390 | `/cards/{id}` | `PATCH` | **Verified**: Request body is `UpdateCardRequest` (`updatedAt` required, `title`, `description`, `startDate`, `dueDate`, `priority`, `assigneeIds`, `labelIds`). **Does NOT contain `status` or `listId`**. |
| `deleteCard` | 1426 | `/cards/{id}` | `DELETE` | **Verified**: Soft deletion, returns `EmptySuccessResponse`. |
| `moveCard` | 1461 | `/cards/{id}/move` | `PATCH` | **Verified**: Request body is `MoveCardRequest` (`targetListId`, `position`, `updatedAt`). Enforces prerequisite check when moving to `DONE`. |
| `createTask` | 1519 | `/cards/{id}/tasks` | `POST` | **Verified**: Request body is `CreateTaskRequest` (`title`), returns `TaskResponse`. |
| `updateTask` | 1554 | `/tasks/{id}` | `PATCH` | **Verified**: Request body is `UpdateTaskRequest` (`title?`, `isCompleted?`), returns `TaskResponse`. |
| `deleteTask` | 1588 | `/tasks/{id}` | `DELETE` | **Verified**: Returns `EmptySuccessResponse`. |
| `createComment` | 1923 | `/cards/{id}/comments` | `POST` | **Verified**: Request body is `CreateCommentRequest` (`content`), returns `CommentResponse`. |
| `getCardActivities` | 2048 | `/cards/{id}/activities` | `GET` | **Verified**: Returns `PaginatedCardActivityResponse`. |

### Existing Reusable Frontend Code

1. **Kanban Board & Canvas:**
   - Active route `/boards/:boardId` with `BoardDetailPage.tsx`.
   - `KanbanBoard.tsx` renders columns (`TO DO`, `IN PROGRESS`, `DONE`) and cards.
   - `@dnd-kit` card drag-and-drop with 7px activation constraint.
   - Native horizontal canvas panning with `data-no-pan` filtering.
2. **Domain Models:**
   - `BoardMember` and `BoardLabel` in `src/types/board.ts`.
   - `KanbanCard`, `CardPriority`, `ListCategory`, `MoveCardInput` in `src/types/kanban.ts`.
3. **API Foundation:**
   - `cardApi.moveCard(cardId, payload)` in `src/apis/card.api.ts` already handles `{ targetListId, position, updatedAt }`.
4. **UI Libraries:**
   - `@radix-ui/react-dialog: ^1.1.4` (Installed — drawer slide-over, focus trap, Escape key handling).
   - `@radix-ui/react-tabs: ^1.1.2` (Installed — Comments vs Activity tabs).
   - `@radix-ui/react-dropdown-menu: ^2.1.4` (Installed — options menu).
   - `sonner: ^1.7.1` (Mounted at root — notification toasts).
   - `lucide-react` icons.

---

## 2. UX & Interaction Architecture

### Drawer Overlay Pattern
- **Route Preservation:** The user remains on `/boards/:boardId`. No URL transitions, avoiding full re-renders and preserving horizontal scroll position.
- **Visual Backdrop:** Backdrop overlay `bg-neutral-900/40 backdrop-blur-2xs` softly emphasizes the drawer while keeping board context visible.
- **Scroll Isolation:** The drawer body has an independent vertical scroll container (`overflow-y-auto scrollbar-thin`). Scrolling inside the drawer never propagates to or moves the Kanban canvas.
- **Click vs Drag Separation:** Pointer movement on cards `< 7px` triggers `onClick` and opens the drawer. Pointer movement `> 7px` triggers `@dnd-kit` card dragging. Canvas background panning ignores clicks on cards and drawer elements.

---

## 3. Domain Model Architecture

### Classification: Existing vs Extend vs New vs Deferred

| Type / Interface | Category | File Location | Rationale |
| :--- | :--- | :--- | :--- |
| `BoardMember`, `BoardLabel` | **Existing** | `src/types/board.ts` | Reused directly. |
| `CardPriority`, `ListCategory`, `MoveCardInput` | **Existing** | `src/types/kanban.ts` | Reused directly. |
| `KanbanCard` | **Extend** | `src/types/kanban.ts` | Add optional sub-entity arrays: `checklist?: ChecklistItem[]`, `dependencies?: CardDependency[]`, `attachments?: CardAttachment[]`, `comments?: CardComment[]`. |
| `UpdateCardInput` | **New** | `src/types/task.ts` | Strictly mirrors OpenAPI `UpdateCardRequest`: `{ title?, description?, startDate?, dueDate?, priority?, assigneeIds?, labelIds?, updatedAt: string }`. **No `status` or `listId`**. |
| `ChecklistItem` | **New** | `src/types/task.ts` | Maps to OpenAPI `TaskResponse`: `{ id, cardId, title, isCompleted, position, createdAt?, updatedAt? }`. |
| `CardDependency` | **New** | `src/types/task.ts` | Maps to OpenAPI `CardDependencyResponse`: `{ id, cardId, prerequisiteCardId, prerequisiteCode, prerequisiteTitle, prerequisiteStatus, isCompleted }`. |
| `CardAttachment` | **New** | `src/types/task.ts` | Maps to OpenAPI `CardAttachment`: `{ id, cardId, fileName, fileUrl, fileSize, uploadedBy, uploadedAt? }`. |
| `CardComment` | **New** | `src/types/task.ts` | Maps to OpenAPI `CommentResponse`: `{ id, cardId, author: BoardMember, content: string, createdAt: string, updatedAt? }`. |
| `CardActivity` | **New** | `src/types/task.ts` | Maps to OpenAPI `CardActivityResponse`: `{ id, cardId, user: BoardMember, action: string, createdAt: string }`. |
| `BinaryUploadR2`, `WebSocketPresence` | **Deferred** | - | Postponed to future phases (P2). |

```ts
// src/types/task.ts — Strictly mirrors Backend OpenAPI schemas
import type { BoardMember } from "./board";
import type { CardPriority } from "./kanban";

export interface UpdateCardInput {
  title?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  priority?: CardPriority;
  assigneeIds?: string[];
  labelIds?: string[];
  updatedAt: string; // Required for OCC concurrency check
}

export interface ChecklistItem {
  id: string;
  cardId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardDependency {
  id: string;
  cardId: string;
  prerequisiteCardId: string;
  prerequisiteCode: string;
  prerequisiteTitle: string;
  prerequisiteStatus: "TODO" | "IN_PROGRESS" | "DONE";
  isCompleted: boolean;
}

export interface CardAttachment {
  id: string;
  cardId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy: BoardMember;
  uploadedAt?: string;
}

export interface CardComment {
  id: string;
  cardId: string;
  author: BoardMember;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CardActivity {
  id: string;
  cardId: string;
  user: BoardMember;
  action: string;
  createdAt: string;
}
```

---

## 4. API Operations Matrix

All API functions mirror the verified OpenAPI contracts and enforce Optimistic Concurrency Control (OCC):

| Operation | Frontend Method | Backend Route | Request Payload | Response Model | Mock / In-Memory Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Get Card Detail** | `cardApi.getCardById(cardId)` | GET `/api/v1/cards/{id}` | None | `Promise<KanbanCard>` | Returns card with populated checklist, dependencies, attachments, and comments. |
| **Update Card Fields** | `cardApi.updateCard(cardId, payload)` | PATCH `/api/v1/cards/{id}` | `UpdateCardInput` | `Promise<KanbanCard>` | Validates `card.updatedAt === payload.updatedAt`. If mismatched, throws `409 Conflict`. Mutates fields and generates fresh `updatedAt`. |
| **Move Card / Status** | `cardApi.moveCard(cardId, payload)` | PATCH `/api/v1/cards/{id}/move` | `MoveCardInput` (`targetListId`, `position`, `updatedAt`) | `Promise<void>` | Enforces prerequisite validation: if target column is DONE and `card.isBlocked`, rejects with `409 Conflict (DEPENDENCY_UNRESOLVED)`. Reorders and updates `updatedAt`. |
| **Delete Card** | `cardApi.deleteCard(cardId)` | DELETE `/api/v1/cards/{id}` | None | `Promise<void>` | Soft deletes card from list and updates board state. |
| **Add Checklist Task** | `cardApi.addChecklistItem(cardId, title)` | POST `/api/v1/cards/{id}/tasks` | `{ title: string }` | `Promise<ChecklistItem>` | Appends task, increments `tasksCount`. |
| **Toggle Checklist Task** | `cardApi.updateChecklistItem(taskId, updates)` | PATCH `/api/v1/tasks/{id}` | `{ title?: string, isCompleted?: boolean }` | `Promise<ChecklistItem>` | Updates completion, recalculates `completedTasksCount`. |
| **Delete Checklist Task** | `cardApi.deleteChecklistItem(taskId)` | DELETE `/api/v1/tasks/{id}` | None | `Promise<void>` | Removes task, decrements `tasksCount` and updates `completedTasksCount`. |
| **Create Comment** | `cardApi.addComment(cardId, content)` | POST `/api/v1/cards/{id}/comments` | `{ content: string }` | `Promise<CardComment>` | Appends comment with current authenticated user as author. |
| **List Activities (Lazy)**| `cardApi.getActivities(cardId)` | GET `/api/v1/cards/{id}/activities` | None | `Promise<CardActivity[]>` | **Lazy-loaded on tab click**. Returns audit log entries for status transitions and edits. |

---

## 5. Component Architecture

```text
src/components/kanban/
├── detail/
│   ├── CardDetailDrawer.tsx          # Dialog.Root, Portal, Overlay, Content slide-over container
│   ├── CardDetailHeader.tsx          # Monospace code badge, editable title, verified options menu, close button
│   ├── CardDetailMetadata.tsx        # Status select (calls moveCard), Priority select, Assignee select, Dates, Labels
│   ├── CardDetailDescription.tsx     # 1000ms debounced + onBlur autosave textarea with visual status indicator
│   ├── CardDetailChecklist.tsx       # Progress bar, counter, checkboxes, inline add task input
│   ├── CardDetailDependencies.tsx    # Conditional blocked alert (if isBlocked), prerequisite items, disabled + Add button
│   ├── CardDetailAttachments.tsx     # Read-only file cards & disabled "+ Upload" button with tooltip
│   ├── CardDetailActivity.tsx        # Radix Tabs: Comments stream (active by default) + Lazy-loaded Activity log
│   └── index.ts                      # Re-exports detail components
└── index.ts                          # Re-exports Kanban public components
```

---

## 6. State Architecture & Data Flow

```text
BoardDetailPage
 ├── useBoardDetail(boardId)
 │    ├── board: BoardDetail (Single Source of Truth)
 │    ├── selectedCardId: string | null
 │    ├── selectedCard: KanbanCard | null (Derived memo from board.lists + selectedCardId)
 │    ├── handleSelectCard(card)
 │    ├── handleCloseCardDetail()
 │    │
 │    ├── handleStatusChange(card: KanbanCard, targetCategory: ListCategory)
 │    │    ├── Resolves targetListId from board.lists where category === targetCategory
 │    │    ├── If targetCategory === "DONE" and card.isBlocked:
 │    │    │    └── Blocks transition, shows toast.error("Cannot move to Done: Prerequisite is not completed.")
 │    │    └── Calls cardApi.moveCard(card.id, { targetListId, position, updatedAt: card.updatedAt })
 │    │         └── Optimistically relocates card in board.lists and updates updatedAt
 │    │
 │    ├── handleUpdateCard(cardId, payload: UpdateCardInput)
 │    │    └── Calls cardApi.updateCard -> Optimistically updates fields in board.lists
 │    │         └── On 409 Conflict: shows toast.error("Card was modified by another session. Refreshing...") & reload()
 │    │
 │    ├── handleDeleteCard(cardId)
 │    │    └── Calls cardApi.deleteCard -> Removes card from board.lists, closes drawer, shows toast.success("Card deleted")
 │    │
 │    ├── handleAddChecklistItem(cardId, title)
 │    ├── handleToggleChecklistItem(cardId, taskId, isCompleted)
 │    ├── handleDeleteChecklistItem(cardId, taskId)
 │    └── handleAddComment(cardId, content)
 │
 ├── KanbanBoard (renders columns & cards)
 │    └── onCardClick -> handleSelectCard(card)
 │
 └── CardDetailDrawer (open = Boolean(selectedCardId))
      ├── card = selectedCard
      ├── lists = board.lists
      ├── onClose = handleCloseCardDetail
      ├── onUpdate = handleUpdateCard
      ├── onStatusChange = handleStatusChange
      ├── onDelete = handleDeleteCard
      │
      └── Ephemeral Local State inside Drawer:
           ├── isEditingTitle: boolean
           ├── descriptionDraft: string (synced with card.description on card switch)
           ├── descriptionSaveStatus: "idle" | "unsaved" | "saving" | "saved"
           ├── newChecklistDraft: string
           ├── commentDraft: string
           ├── activeTab: "comments" | "activity"
           └── activitiesState: { data: CardActivity[] | null, isLoading: boolean } (Lazy-loaded on tab click)
```

### Business Logic Rules for Blocked Cards vs Normal Cards
- **`isBlocked` Rule:** A card is blocked if and only if at least one of its prerequisites has `isCompleted === false` (or status $\neq$ `DONE`).
- **`NEX-101` (Normal Happy Path):**
  - Prerequisite: `NEX-107: Setup Design Tokens` has `isCompleted: true` (Status: `DONE`).
  - Therefore, `NEX-101.isBlocked = false`.
  - **No blocked alert banner** is displayed for `NEX-101`.
  - Can be freely moved between `TO DO`, `IN PROGRESS`, and `DONE`.
- **`NEX-103` (Blocked Test Case):**
  - Prerequisite: `NEX-102: Wireframes & UX Flow` has `isCompleted: false` (Status: `IN_PROGRESS`).
  - Therefore, `NEX-103.isBlocked = true` with `blockReason = "Waiting on NEX-102: Wireframes & UX Flow"`.
  - When opened in the drawer, the **rose/error blocked alert banner** is displayed: `"Blocked by an incomplete prerequisite: NEX-102 must be completed first."`
  - Attempting to change status to `DONE` via the drawer status selector (or Kanban drag) is rejected with `toast.error("Cannot move to Done: Prerequisite 'NEX-102' is not completed.")`.

---

## 7. Implementation Tasks

### Task 1: Domain Models & Consistent Mock Dataset
**Files:**
- Create: `src/types/task.ts`
- Modify: `src/types/kanban.ts`
- Modify: `src/types/index.ts`
- Modify: `src/mocks/data/kanban.mock.ts`

**Interfaces:**
- Produces: `ChecklistItem`, `CardDependency`, `CardAttachment`, `CardComment`, `CardActivity`, `UpdateCardInput`
- Consumes: `BoardMember`, `BoardLabel`, `CardPriority`, `ListCategory`

- [ ] **Step 1: Define task sub-entities and input types in `src/types/task.ts`**
  - Define `UpdateCardInput` strictly matching OpenAPI `UpdateCardRequest` (`title`, `description`, `startDate`, `dueDate`, `priority`, `assigneeIds`, `labelIds`, `updatedAt`). **Do not include `status` or `listId`**.
  - Define `ChecklistItem` matching OpenAPI `TaskResponse`.
  - Define `CardDependency`, `CardAttachment`, `CardComment`, `CardActivity`.
- [ ] **Step 2: Export `task.ts` in `src/types/index.ts` and add optional sub-entity arrays to `KanbanCard` in `src/types/kanban.ts`**
- [ ] **Step 3: Enrich `MOCK_BOARD_DETAIL` in `src/mocks/data/kanban.mock.ts` with consistent data**
  - `card-101` (`NEX-101`): `isBlocked: false`, `checklist`: `"Draft quotes"` (`isCompleted: true`), `"Legal review"` (`isCompleted: false`); `dependencies`: linked to `NEX-107` (`isCompleted: true`, status `DONE`); `attachments`: `copydeck_v2.docx` (124 KB, Emily Chen), `landing-mockup.png` (2.4 MB, Alex Morgan); `comments`: Emily Chen ("Yesterday at 4:15 PM"), Phan Gia Đạt ("2 hours ago").
  - `card-103` (`NEX-103`): `isBlocked: true`, `blockReason: "Waiting on NEX-102: Wireframes & UX Flow"`, `dependencies`: linked to `NEX-102` (`isCompleted: false`, status `IN_PROGRESS`).
- [ ] **Step 4: Verify typecheck:** `npm run typecheck`
- [ ] **Step 5: Commit:** `git commit -m "feat(kanban): define task domain models and consistent mock dataset matching OpenAPI"`

---

### Task 2: Card Detail API Operations (OpenAPI-aligned with OCC)
**Files:**
- Modify: `src/apis/card.api.ts`

**Interfaces:**
- Consumes: `UpdateCardInput`, `ChecklistItem`, `CardComment`, `CardActivity`
- Produces: `cardApi.updateCard`, `cardApi.addChecklistItem`, `cardApi.updateChecklistItem`, `cardApi.deleteChecklistItem`, `cardApi.addComment`, `cardApi.getActivities`, `cardApi.deleteCard`

- [ ] **Step 1: Implement `updateCard(cardId, payload)` with OCC enforcement in `src/apis/card.api.ts`**
  - Check `card.updatedAt === payload.updatedAt`. If mismatch, throw `Error("CARD_CONFLICT: Card was modified by another session.")`.
  - Mutate specified fields (`title`, `description`, `startDate`, `dueDate`, `priority`, `assignees`, `labels`).
  - Generate new `updatedAt = new Date().toISOString()`.
- [ ] **Step 2: Implement checklist operations mapping to `/cards/{id}/tasks` and `/tasks/{id}`**
  - `addChecklistItem(cardId: string, title: string): Promise<ChecklistItem>` (POST `/cards/{id}/tasks`)
  - `updateChecklistItem(taskId: string, updates: { title?: string; isCompleted?: boolean }): Promise<ChecklistItem>` (PATCH `/tasks/{id}`)
  - `deleteChecklistItem(taskId: string): Promise<void>` (DELETE `/tasks/{id}`)
  - Recalculate `tasksCount` and `completedTasksCount` on the parent card.
- [ ] **Step 3: Implement comment, activity, and verified deleteCard operations**
  - `addComment(cardId: string, content: string): Promise<CardComment>` (POST `/cards/{id}/comments`)
  - `getActivities(cardId: string): Promise<CardActivity[]>` (GET `/cards/{id}/activities`)
  - `deleteCard(cardId: string): Promise<void>` (DELETE `/cards/{id}` — verified OpenAPI line 1426)
- [ ] **Step 4: Verify typecheck and lint:** `npm run typecheck && npm run lint`
- [ ] **Step 5: Commit:** `git commit -m "feat(api): implement card detail update, checklist tasks, lazy activity, and deleteCard matching OpenAPI"`

---

### Task 3: State Orchestration in `useBoardDetail` (Single Source of Truth, MoveCard Status, & Lazy Activity)
**Files:**
- Modify: `src/hooks/useBoardDetail.ts`

**Interfaces:**
- Consumes: `cardApi`, `boardApi`, `listApi`
- Produces: `selectedCard`, `selectedCardId`, `handleSelectCard`, `handleCloseCardDetail`, `handleUpdateCard`, `handleStatusChange`, `handleDeleteCard`, `handleAddChecklistItem`, `handleToggleChecklistItem`, `handleDeleteChecklistItem`, `handleAddComment`, `fetchCardActivities`

- [ ] **Step 1: Add `selectedCardId` state and memoized `selectedCard` selector in `useBoardDetail.ts`**
  - Derive `selectedCard` directly from `board.lists` so any card updates immediately reflect in the drawer.
- [ ] **Step 2: Implement `handleStatusChange(card, targetCategory)`**
  - Find target list in `board.lists` where `list.category === targetCategory`.
  - If `targetCategory === "DONE"` and `card.isBlocked`, show `toast.error("Cannot move to Done: Prerequisite is not completed.")` and return early.
  - Calculate position and dispatch `cardApi.moveCard(card.id, { targetListId, position, updatedAt: card.updatedAt })`.
  - Optimistically transfer card between lists in `board.lists` and update `updatedAt`.
- [ ] **Step 3: Implement `handleUpdateCard(cardId, payload)` with OCC error handling**
  - Optimistically update card fields in `board.lists`.
  - On error / `CARD_CONFLICT`, show `toast.error("Conflict detected: card updated remotely. Refreshing...")` and invoke `reload()`.
- [ ] **Step 4: Implement `handleDeleteCard(cardId)`**
  - Remove card from `board.lists` optimistically, close drawer, call `cardApi.deleteCard(cardId)`, and show `toast.success("Card deleted")`.
- [ ] **Step 5: Implement checklist, comment mutations, and lazy activity fetcher in `useBoardDetail.ts`**
  - Checklist mutations immediately update `tasksCount` and `completedTasksCount` so the board card counter updates in sync.
- [ ] **Step 6: Verify typecheck:** `npm run typecheck`
- [ ] **Step 7: Commit:** `git commit -m "feat(hooks): integrate status moveCard, OCC handling, and card mutations in useBoardDetail"`

---

### Task 4: Card Detail Header & Core Metadata Components
**Files:**
- Create: `src/components/kanban/detail/CardDetailHeader.tsx`
- Create: `src/components/kanban/detail/CardDetailMetadata.tsx`
- Modify: `src/components/kanban/index.ts`

**Interfaces:**
- Consumes: `KanbanCard`, `BoardDetail`, `onUpdate`, `onStatusChange`, `onDelete`, `onClose`
- Produces: `CardDetailHeader`, `CardDetailMetadata`

- [ ] **Step 1: Build `CardDetailHeader.tsx`**
  - Monospace code badge (e.g. `NEX-101`) in subtle neutral styling (`bg-neutral-100 text-neutral-600 font-mono text-xs px-2 py-0.5 rounded`).
  - Editable inline card title with blur/enter commit calling `onUpdate({ title, updatedAt })`.
  - Options dropdown menu (`...`) strictly containing verified actions:
    - `Copy card link` (copies current board URL with `#card-{id}` to clipboard via `navigator.clipboard.writeText`, shows toast).
    - `Delete card` (destructive red text, triggers confirmation or direct `onDelete(card.id)`).
    - `Close panel`.
  - Accessible Close button (`X`) with `aria-label="Close task details"`.
- [ ] **Step 2: Build `CardDetailMetadata.tsx`**
  - **STATUS** selector (`TO DO`, `IN PROGRESS`, `DONE`): selecting status invokes `onStatusChange(card, newCategory)` which executes `moveCard`. Never calls `updateCard({ status })`.
  - **PRIORITY** selector (`LOW`, `MEDIUM`, `HIGH`, `URGENT` with Lucide priority icons and semantic colors) invoking `onUpdate({ priority, updatedAt })`.
  - **ASSIGNEE** selector (Member Avatar + Name) invoking `onUpdate({ assigneeIds, updatedAt })`.
  - **START DATE & DUE DATE** inputs with clean formatted dates (e.g. `Sep 20`, `Sep 28`).
  - **LABELS** row rendering tag pills (e.g. `Content`, `Design`) and disabled `+ Label` button with tooltip ("Label management in next release").
- [ ] **Step 3: Verify typecheck:** `npm run typecheck`
- [ ] **Step 4: Commit:** `git commit -m "feat(kanban): build CardDetailHeader and CardDetailMetadata with moveCard status selector"`

---

### Task 5: Description, Checklist & Dependency Components
**Files:**
- Create: `src/components/kanban/detail/CardDetailDescription.tsx`
- Create: `src/components/kanban/detail/CardDetailChecklist.tsx`
- Create: `src/components/kanban/detail/CardDetailDependencies.tsx`

**Interfaces:**
- Consumes: `KanbanCard`, `ChecklistItem`, `CardDependency`
- Produces: `CardDetailDescription`, `CardDetailChecklist`, `CardDetailDependencies`

- [ ] **Step 1: Build `CardDetailDescription.tsx` with debounced autosave**
  - Section header `DESCRIPTION` with status indicator (`Unsaved changes...` / `Saving...` / `Auto-saved`).
  - Local `descriptionDraft` state updated immediately on user typing.
  - Autosave triggers after a **1000ms debounce** OR immediately on **blur** (`onBlur`) if text changed.
  - Dispatches `onUpdate({ description: descriptionDraft, updatedAt: card.updatedAt })`.
- [ ] **Step 2: Build `CardDetailChecklist.tsx`**
  - Header with progress counter `1/2 (50%)` and animated progress bar (`h-1.5 rounded-full bg-primary-600`).
  - Checklist item rows with accessible checkbox, strikethrough on complete, and delete button.
  - Checkbox toggle calls `onToggleChecklistItem(taskId, isCompleted)`.
  - Inline `Add a new checklist task...` input with `Add` button (calls `onAddChecklistItem`).
- [ ] **Step 3: Build `CardDetailDependencies.tsx`**
  - Section header `DEPENDENCIES & PREREQUISITES` with disabled `+ Add dependency` button (tooltip: "Dependency management in development").
  - **Conditional Blocked Warning Banner:** Renders **only if** `card.isBlocked === true` (e.g. for `NEX-103`). For `NEX-101` where prerequisite `NEX-107` is complete, **no blocked banner** is rendered.
  - Linked prerequisite card row (`NEX-107 Approve brand guidelines & typography tokens` with `Done` badge).
  - Linked dependent card row (e.g. `NEX-105 Design System Tokens` waiting on this card).
  - Strictly read-only reference data matching current backend scope.
- [ ] **Step 4: Verify typecheck:** `npm run typecheck`
- [ ] **Step 5: Commit:** `git commit -m "feat(kanban): build Description with debounced autosave, Checklist, and Dependencies with consistent blocked logic"`

---

### Task 6: Attachments & Lazy-Loaded Activity / Comments Stream
**Files:**
- Create: `src/components/kanban/detail/CardDetailAttachments.tsx`
- Create: `src/components/kanban/detail/CardDetailActivity.tsx`

**Interfaces:**
- Consumes: `CardAttachment`, `CardComment`, `CardActivity`, `onAddComment`, `onFetchActivities`
- Produces: `CardDetailAttachments`, `CardDetailActivity`

- [ ] **Step 1: Build `CardDetailAttachments.tsx`**
  - Section title `ATTACHMENTS (2)` with disabled `+ Upload` button (tooltip: "Cloud storage upload in development").
  - 2-column preview cards: file type icon, file name (`copydeck_v2.docx`, `landing-mockup.png`), file size, uploader avatar/name.
  - Read-only reference data matching current phase scope.
- [ ] **Step 2: Build `CardDetailActivity.tsx` with lazy loading**
  - Radix Tabs: `Comments (count)` (default) and `Activity`.
  - **Comments Stream:** Current user avatar + comment input with submit button calling `onAddComment`, rendered comment list with relative timestamps.
  - **Activity Log:** Lazy-loaded when switching to the `Activity` tab.
    - If activities not yet fetched for this card, calls `cardApi.getActivities(card.id)` and shows loading skeleton.
    - Caches activities in component state while drawer is open.
    - Renders chronological audit log items with member avatar and transition text.
- [ ] **Step 3: Verify typecheck:** `npm run typecheck`
- [ ] **Step 4: Commit:** `git commit -m "feat(kanban): build Attachments and lazy-loaded Activity/Comments stream"`

---

### Task 7: Assemble `CardDetailDrawer` & Integrate with `BoardDetailPage`
**Files:**
- Create: `src/components/kanban/detail/CardDetailDrawer.tsx`
- Create: `src/components/kanban/detail/index.ts`
- Modify: `src/components/kanban/index.ts`
- Modify: `src/pages/boards/BoardDetailPage.tsx`

**Interfaces:**
- Consumes: all detail sub-components, `useBoardDetail`
- Produces: complete Drawer overlay mounted over `BoardDetailPage`

- [ ] **Step 1: Build `CardDetailDrawer.tsx` using `@radix-ui/react-dialog`**
  - `<Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>`
  - Overlay: `fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-2xs transition-opacity duration-200`
  - Drawer panel: `fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl border-l border-neutral-200 flex flex-col focus:outline-hidden animate-in slide-in-from-right duration-200`
  - Accessible `<Dialog.Title className="sr-only">Task Detail</Dialog.Title>`
  - Scrollable content area: `flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin`
- [ ] **Step 2: Wire `CardDetailDrawer` in `src/pages/boards/BoardDetailPage.tsx`**
  - Connect `KanbanBoard`'s `onCardClick` to `handleSelectCard`.
  - Render `CardDetailDrawer` with `card={selectedCard}`, `isOpen={Boolean(selectedCardId)}`, `onClose={handleCloseCardDetail}`, and mutation handlers.
- [ ] **Step 3: Verify quality gates:**
  `npm run typecheck && npm run lint && npm run build`
- [ ] **Step 4: Commit:** `git commit -m "feat(kanban): assemble CardDetailDrawer and integrate with BoardDetailPage"`

---

### Task 8: Verification & Quality Assurance
**Files:**
- Playwright verification script `scratch/verify_card_detail.mjs`

- [ ] **Step 1: Verify Card Detail opening flow:** Click card `NEX-101` $\rightarrow$ drawer slides in smoothly from the right over the Kanban board.
- [ ] **Step 2: Verify DnD separation:** Dragging a card between columns does NOT trigger drawer opening.
- [ ] **Step 3: Verify closing interactions:** Press Escape $\rightarrow$ closes; click backdrop $\rightarrow$ closes; click `X` $\rightarrow$ closes; focus returns to clicked card.
- [ ] **Step 4: Verify Status Change via `moveCard`:**
  - On `NEX-101`: change status to `DONE` $\rightarrow$ succeeds immediately because prerequisite `NEX-107` is complete. Card moves to `DONE` column on board.
  - On `NEX-103`: change status to `DONE` $\rightarrow$ rejected with toast alert "Cannot move to Done: Prerequisite is not completed". Card stays in `TO DO`.
- [ ] **Step 5: Verify Description Autosave:** Edit description $\rightarrow$ indicator shows `Unsaved changes...` $\rightarrow$ debounces 1000ms $\rightarrow$ shows `Saving...` $\rightarrow$ `Auto-saved`. Refresh card state confirms persistence.
- [ ] **Step 6: Verify Checklist mutations:** Toggle a checklist item $\rightarrow$ counter updates on drawer and board card (`1/2` $\rightarrow$ `2/2`). Add new item $\rightarrow$ counter increments to `3/3`.
- [ ] **Step 7: Verify Lazy-loaded Activity:** Open drawer $\rightarrow$ Activity is not fetched yet. Click "Activity" tab $\rightarrow$ spinner/skeleton appears and activity logs load.
- [ ] **Step 8: Verify Delete Card:** In options menu, click `Delete card` $\rightarrow$ card removed from board, drawer closes, toast shows "Card deleted".
- [ ] **Step 9: Run final quality gates:**
  `npm run typecheck && npm run lint && npm run build`

---

## 8. UX & Accessibility Standards

- Accessible `role="dialog"` and `aria-modal="true"` provided by Radix Dialog.
- Keyboard focus trapped inside drawer while open; focus restored to clicked card trigger on close.
- `Escape` key closes drawer instantly.
- Close button has explicit `aria-label="Close task details"`.
- Checklist items are fully keyboard navigable (`Tab` + `Space` to toggle).
- Drawer has independent vertical scrollbar; page and Kanban board background do not scroll when scrolling drawer.
- Zero collision with `@dnd-kit` pointer sensors (7px threshold preserves card DnD).
- Zero collision with horizontal canvas panning (no-pan classes protect drawer and cards).

---

## 9. Responsive Strategy

- **Desktop ($\ge$ 1024px):**
  - Drawer width: `w-[640px]` (`max-w-2xl`).
  - Kanban board remains visible on the left side under dimmed overlay.
- **Tablet (768px – 1023px):**
  - Drawer width: `w-[540px]` (`max-w-lg`).
  - Ample room for metadata grid and checklist.
- **Mobile (< 768px):**
  - Drawer width: `w-full` (full-width slide-over sheet).
  - Close button prominently pinned at top-right for easy one-thumb dismissal.

---

## 10. Scope Boundaries

### P0 — Immediate Deliverable (Current Task)
- Slide-over `CardDetailDrawer` opening on card click via Radix Dialog.
- Header with editable title, issue code, verified options menu (Copy link, Delete card, Close), and close button.
- Status dropdown selector that invokes `cardApi.moveCard` (with prerequisite check).
- Core metadata grid (Priority, Assignee, Start Date, Due Date, Labels display).
- Description field with 1000ms debounced / onBlur autosave and status indicator.
- Interactive Checklist with progress bar, counter (`1/2`), and item toggling via `cardApi.updateChecklistItem`.
- Consistent prerequisite dependency display (blocked banner shown only for blocked cards like `NEX-103`; clean state for `NEX-101`).
- Attachments list preview (read-only reference; `Upload` button disabled with coming soon indicator).
- Comments stream display and composer input.
- Lazy-loaded Activity log on tab switch.
- Verified card deletion via `cardApi.deleteCard`.
- Optimistic in-memory synchronization with board card.

### P1 — Secondary Polish (Next Minor Sprint)
- Label picker popover selector if an OpenAPI board label assignment route is mapped.
- Rich-text markdown preview toggle for description.

### P2 — Deferred / Future Milestones
- Binary file upload to Cloudflare R2 & cloud storage backend.
- Creating / deleting card dependencies via API (POST `/cards/{id}/dependencies`).
- Real-time WebSocket multi-user presence avatars.
- Interactive dependency graph visualization.
- Full `/tasks/:taskId` standalone page route.
- AI task auto-summarization and sub-task generation.

---

## 11. Risks & Architectural Mitigations

1. **Status vs UpdateCard Schema Mismatch (Mitigated):**
   - *Risk:* Calling `updateCard({ status })` fails because `status` is not in OpenAPI `UpdateCardRequest`.
   - *Mitigation:* The status selector resolves the target `KanbanList` and dispatches `cardApi.moveCard({ targetListId, position, updatedAt })`.
2. **Blocked-State Logical Contradiction (Mitigated):**
   - *Risk:* Showing a blocked warning when the prerequisite is completed confuses users and breaks business logic.
   - *Mitigation:* `isBlocked` is derived strictly from whether prerequisites are incomplete. `NEX-101` (prerequisite complete) has no blocked banner; `NEX-103` (prerequisite incomplete) has the blocked banner and is prevented from moving to `DONE`.
3. **Delete Card Contract Validity (Mitigated):**
   - *Risk:* Calling unverified endpoints could break on real backend integration.
   - *Mitigation:* Verified against OpenAPI line 1426 (`DELETE /cards/{id}`). Options menu is strictly restricted to supported actions.
4. **Description Autosave Traffic (Mitigated):**
   - *Risk:* Keystroke saves flood the API and cause race conditions.
   - *Mitigation:* 1000ms debounce + blur trigger with visual save indicator and OCC `updatedAt` tracking.
5. **Activity Log Network Eagerness (Mitigated):**
   - *Risk:* Fetching activity logs on every drawer open slows initial render.
   - *Mitigation:* Lazy-loaded on switching to the Activity tab.
6. **Interaction Conflict with `@dnd-kit` (Mitigated):**
   - *Risk:* Clicking a card might accidentally trigger drag, or dragging might trigger the drawer.
   - *Mitigation:* Sensor activation constraint is set to `7px` distance. Clicking opens the drawer; dragging moves the card.
