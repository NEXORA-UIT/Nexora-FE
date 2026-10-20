# Core Screen Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo hierarchy thị giác rõ và trạng thái demo hoàn chỉnh cho các màn Board, Tasks, Calendar và Quick Notes mà không đổi thao tác nghiệp vụ.

**Architecture:** Giữ hook/API hiện có, chỉnh cấu trúc trình bày tại từng page/component và dùng chung `PageHeader`, badge, button và spacing primitives của FE. Tập trung nội dung từ API, trạng thái empty/error và đường đi tới hành động liên quan.

**Tech Stack:** React 18, TypeScript, Tailwind, date-fns, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-20-demo-ready-fe-design.md`

## Global Constraints

- Giữ nguyên thao tác nghiệp vụ và API hiện có.
- Không sửa API contract, backend hoặc database schema.
- Dữ liệu động/user-generated content không bị dịch hoặc thay bằng mẫu.
- Không thêm dependency UI hoặc i18n runtime.
- Không commit thay đổi FE có trước kế hoạch này.

## Review Focus

- Board archived/frozen/permission states vẫn ngăn thao tác sai — test existing BoardDetailPage tests.
- Tasks không có assignee, due date hoặc kết quả phải có copy rõ — test MyTasks states.
- Calendar month navigation ở mobile không làm mất event action — test keyboard/responsive structure.
- Quick Notes empty/error state không ngụ ý dữ liệu đã lưu khi request lỗi — test API error and retry.
- DnD cùng cột/cột rỗng và mở Card Detail vẫn hoạt động sau restyle — chạy DnD/Card Detail regression tests.

---

### Task 1: Nâng hierarchy trang Boards và Board Detail

**Files:**
- Modify: `src/pages/boards/BoardsPage.tsx`, `src/pages/boards/BoardDetailPage.tsx`
- Modify: `src/components/boards/*`, `src/components/kanban/BoardDetailToolbar.tsx`, `KanbanBoard.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`
- Test: tests hiện có ở `src/pages/boards/__tests__`, `src/hooks/__tests__/useBoardDetail.test.ts`, `src/hooks/__tests__/useKanbanDnd.test.tsx`

**Interfaces:** Không đổi props/API business; chỉ thêm presentation props khi cần, giữ Board ID, permission state và DnD callbacks hiện có.

- [ ] **Step 1: Bổ sung regression assertions** — archived/frozen read-only, member permission, card status/priority label, DnD empty/same column.
- [ ] **Step 2: Xác nhận test mục tiêu hiện tại** — `npm exec vitest run src/pages/boards/__tests__ src/hooks/__tests__/useBoardDetail.test.ts src/hooks/__tests__/useKanbanDnd.test.tsx`.
- [ ] **Step 3: Cập nhật visual hierarchy** — workspace hero/board title/toolbar tách lớp rõ; card rows có metadata vừa đủ và responsive; giữ semantics/status.
- [ ] **Step 4: Chạy regression qua** — chạy lại các test ở Step 2 và `npm run typecheck`.
- [ ] **Step 5: Commit** — `style(boards): improve board and card hierarchy`; stage thay đổi thuộc task, bỏ qua API/mappers/types khác.

### Task 2: Hoàn thiện My Tasks và Calendar presentation

**Files:**
- Modify: `src/pages/tasks/MyTasksPage.tsx`, `src/pages/calendar/WorkspaceCalendarPage.tsx`
- Modify: tương ứng `__tests__`

**Interfaces:** Dùng `useMyTasks` và `useWorkspaceCalendar` hiện có; không đổi task/calendar DTO.

- [ ] **Step 1: Viết test các trạng thái** — task count/priority/due date filter từ data thật; calendar month controls, event click và empty month.
- [ ] **Step 2: Xác nhận test thất bại nếu có hành vi chưa hỗ trợ** — chạy đúng các test page tương ứng.
- [ ] **Step 3: Cập nhật hierarchy** — dải summary từ tasks đã tải, filter/search nổi rõ, calendar date/event có contrast; layout hẹp vẫn có controls.
- [ ] **Step 4: Chạy page tests qua** — `npm exec vitest run src/pages/tasks src/pages/calendar`.
- [ ] **Step 5: Commit** — `style(planning): clarify tasks and calendar views`.

### Task 3: Hoàn thiện Quick Notes và cross-flow demo

**Files:**
- Modify: `src/pages/quick-notes/QuickNotesPage.tsx`, tương ứng tests

**Interfaces:** Giữ `quickNoteApi` contracts hiện có; conversion dùng board/list IDs thật đã tải.

- [ ] **Step 1: Bổ sung test** — note create/edit/delete, empty/error/reload, convert sang Card chọn đúng Board/List, user content giữ nguyên.
- [ ] **Step 2: Chạy test để xác nhận baseline** — `npm exec vitest run src/pages/quick-notes`.
- [ ] **Step 3: Cập nhật note workspace** — trình bày như notebook/list-editor với content preview, CTA convert và feedback rõ; không mô phỏng save thành công.
- [ ] **Step 4: Chạy cross-flow regression** — `npm exec vitest run src/pages/quick-notes src/pages/boards src/hooks/__tests__/useBoardDetail.test.ts src/hooks/__tests__/useKanbanDnd.test.tsx`.
- [ ] **Step 5: Commit** — `style(core): polish quick notes flow`.
