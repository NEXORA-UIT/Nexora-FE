# Workspace Demo Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện Workspace Overview và Settings để người dùng trình bày được thông tin và cập nhật workspace bằng API hiện có.

**Architecture:** Tách tab Overview/Settings thành component riêng; tái sử dụng store, `useWorkspaceBoards`, `useWorkspaceMembership` và `workspaceApi.updateWorkspace`. Component sở hữu loading/error/empty/permission states và nhận dữ liệu thật, không thêm API hay domain model mới.

**Tech Stack:** React 18, TypeScript, Tailwind, Zustand, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-20-demo-ready-fe-design.md`

## Global Constraints

- Giữ nguyên API, database schema và nghiệp vụ backend.
- Số liệu cho workspace, boards và members lấy từ API hoặc state hiện có; không đưa số liệu giả vào dashboard để tạo ấn tượng.
- UI copy tiếng Anh; nội dung người dùng và tên riêng không dịch.
- Không thêm dependency UI hoặc hệ thống i18n runtime.
- Không stage hoặc commit thay đổi FE đã có trước kế hoạch này.

## Review Focus

- Workspace không có boards/members phải hiển thị empty state có hành động kế tiếp — test Overview.
- Owner chỉ sửa workspace active; Member, archived hoặc frozen workspace không được sửa — test Settings permission states.
- Request update chỉ chứa giá trị đã đổi và lỗi API không bị mất — test submit/error.
- Workspace chưa tải hoặc API lỗi phải có loading/retry state — test integration.
- Tab controls phải dùng được bằng bàn phím và không tràn ở viewport hẹp — test accessible roles và responsive structure.

---

### Task 1: Tạo Workspace Overview từ dữ liệu thật

**Files:**
- Create: `src/components/workspace/WorkspaceOverviewPanel.tsx`
- Test: `src/components/workspace/__tests__/WorkspaceOverviewPanel.test.tsx`
- Modify: `src/pages/boards/BoardsPage.tsx`

**Interfaces:** `WorkspaceOverviewPanel` nhận `{ workspace: Workspace; boards: Board[]; onCreateBoardClick: () => void }`; lấy member data qua `useWorkspaceMembership(workspace.id)` và hiển thị tổng quan cùng board gần đây.

- [ ] **Step 1: Viết test thất bại** — test workspace name/description, số active/archived boards từ props, số members từ hook, link mở board, create callback, empty boards, loading/error membership.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/components/workspace/__tests__/WorkspaceOverviewPanel.test.tsx`.
- [ ] **Step 3: Cài đặt panel** — dùng layout overview phân cấp rõ, số liệu chỉ từ props/hook; mọi link board dùng `getBoardDetailRoute`.
- [ ] **Step 4: Chạy test qua** — chạy lại test panel; kiểm tra role Owner/Member không làm rò thao tác quản trị.
- [ ] **Step 5: Commit** — `feat(workspace): add data-backed overview tab`; chỉ stage file thuộc task.

### Task 2: Tạo Workspace Settings có quyền và cập nhật thật

**Files:**
- Create: `src/components/workspace/WorkspaceSettingsPanel.tsx`
- Test: `src/components/workspace/__tests__/WorkspaceSettingsPanel.test.tsx`
- Modify: `src/pages/boards/BoardsPage.tsx`

**Interfaces:** Panel nhận `{ workspace: Workspace }`, lấy quyền hiện tại qua `useWorkspaceMembership`, gọi `useWorkspaceStore.getState().updateWorkspace(workspace.id, UpdateWorkspaceRequest)` khi submit.

- [ ] **Step 1: Viết test thất bại** — Owner active thấy form name/description/domainCategory; Member, archived hoặc `isFrozen` thấy form read-only; submit chỉ gửi trường thay đổi; lỗi API hiện thông báo an toàn tiếng Anh.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/components/workspace/__tests__/WorkspaceSettingsPanel.test.tsx`.
- [ ] **Step 3: Cài đặt form** — dùng đúng enum `WorkspaceDomainCategory` và store method hiện có; giữ trạng thái form, submit và error rõ ràng.
- [ ] **Step 4: Chạy test qua** — chạy test panel và `npm exec vitest run src/apis/__tests__/workspace.api.test.ts src/stores/__tests__/workspace.store.test.ts`.
- [ ] **Step 5: Commit** — `feat(workspace): add owner workspace settings`; không stage file API/types ngoài phạm vi.

### Task 3: Nối Overview/Settings vào Workspace tabs

**Files:**
- Modify: `src/pages/boards/BoardsPage.tsx`
- Modify: `src/pages/boards/__tests__/BoardsPage.workspace.test.tsx`

**Interfaces:** Tab `overview` render `WorkspaceOverviewPanel`; `members` giữ `WorkspaceMembersPanel`; `settings` render `WorkspaceSettingsPanel`; `boards` giữ flow hiện hành.

- [ ] **Step 1: Viết test thất bại** — click từng tab kiểm tra đúng panel; workspace archived giữ boards/members/settings read-only; không workspace vẫn giữ CTA tạo workspace.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/pages/boards/__tests__/BoardsPage.workspace.test.tsx`.
- [ ] **Step 3: Nối các panel** — chỉ thay nội dung tab placeholder và giữ các handler hiện có.
- [ ] **Step 4: Chạy test qua** — `npm exec vitest run src/pages/boards/__tests__/BoardsPage.workspace.test.tsx src/components/workspace/__tests__`.
- [ ] **Step 5: Commit** — `feat(workspace): complete workspace tabs`; rà staged diff để không đưa Board/Card changes cũ vào.
