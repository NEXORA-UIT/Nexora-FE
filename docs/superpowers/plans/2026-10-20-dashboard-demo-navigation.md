# Dashboard and Demo Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm app shell/dashboard giàu nội dung từ API thật và bảo đảm CTA không dẫn đến trang chết.

**Architecture:** Dùng các hook workspace/board/task hiện có để dựng dashboard theo dữ liệu thật; các component dashboard nhận dữ liệu qua props để tránh gọi trùng hook. Sidebar/topbar giữ route Core; loại bỏ điều khiển search/notification chưa có backend, giữ AI entry với trạng thái ngoài phạm vi.

**Tech Stack:** React 18, TypeScript, React Router, Zustand, Tailwind, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-20-demo-ready-fe-design.md`

## Global Constraints

- Số liệu boards/tasks/members lấy từ API hoặc state hiện có; không đưa số giả vào dashboard.
- CTA dashboard, sidebar, topbar và landing trỏ đến route/flow đang có.
- Không thêm notification service hoặc global search endpoint.
- AI Assistant/AI Agents nằm ngoài phạm vi; không hiển thị khả năng AI như đang hoạt động.
- Giữ API/schema và không commit thay đổi đã tồn tại trước kế hoạch.

## Review Focus

- Không có workspace hoặc không có task phải hiển thị hướng bắt đầu rõ ràng — test dashboard empty states.
- API trả lỗi hoặc một số boards lỗi tải phải có trạng thái retry/partial data — test dashboard retry.
- Board/card link phải dùng ID thật, không route mock — test CTA destination.
- AI CTA không dẫn tới một tính năng giả — test trạng thái/route được giữ ngoài phạm vi.
- Navigation ở màn nhỏ không tràn và mọi control có accessible name — test responsive/ARIA structure.

---

### Task 1: Làm mới App shell và điều hướng

**Files:**
- Modify: `src/layouts/AppLayout.tsx`, `src/components/navigation/Sidebar.tsx`, `Topbar.tsx`, `UserMenu.tsx`
- Test: `src/components/navigation/__tests__/Navigation.test.tsx`

**Interfaces:** Dùng các route có trong `ROUTES`; không thêm navigation API.

- [ ] **Step 1: Viết test thất bại** — Sidebar links đi tới Boards/Tasks/Calendar/Quick Notes/Knowledge/Help; AI hiện nhãn chưa triển khai; Create đi tới Boards; không render search/notification control inert.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/components/navigation/__tests__/Navigation.test.tsx`.
- [ ] **Step 3: Cập nhật shell** — nền slate ấm, sidebar tối theo brand blue, typography/active state rõ; giữ responsive và keyboard focus.
- [ ] **Step 4: Chạy test qua** — chạy navigation tests và `npm run typecheck`.
- [ ] **Step 5: Commit** — `style(navigation): refresh app shell and working routes`; stage từng file/patch đã rà.

### Task 2: Thay dashboard fixtures bằng dữ liệu hiện có

**Files:**
- Modify: `src/pages/HomePage.tsx`, `src/components/dashboard/HomeGreeting.tsx`, `MyWorkSection.tsx`, `UpcomingSection.tsx`, `ContinueWorkingSection.tsx`, `AiInsightCard.tsx`
- Test: `src/components/dashboard/__tests__/HomeDashboard.test.tsx`

**Interfaces:** `HomePage` gọi `useMyTasks` một lần và truyền `{ tasks, isLoading, error, reload }` tới task panels; board cards dùng `useWorkspaceBoards`/API hiện có; task link dùng `getBoardDetailRoute`.

- [ ] **Step 1: Viết test thất bại** — workspace/user/count lấy từ store/API; tasks/due date lấy từ hook; loading/error/empty/retry; card click dùng Board ID thật; không render insight/activity mock.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/components/dashboard/__tests__/HomeDashboard.test.tsx`.
- [ ] **Step 3: Cài đặt dashboard data flow** — không gọi hook task riêng ở child; bỏ `AiInsightCard` hardcoded khỏi dashboard, giữ AI access chỉ ở trạng thái unavailable.
- [ ] **Step 4: Chạy test qua** — dashboard tests và `npm exec vitest run src/pages/tasks`.
- [ ] **Step 5: Commit** — `feat(dashboard): show live workspace and task data`.

### Task 3: Rà CTA landing/dashboard/topbar toàn ứng dụng

**Files:**
- Modify: `src/components/landing/LandingHero.tsx`, `LandingCta.tsx`, `LandingFooter.tsx`, `src/components/dashboard/*`, `src/components/navigation/Topbar.tsx`
- Test: `src/components/landing/__tests__/LandingNavigation.test.tsx`, dashboard/navigation tests

**Interfaces:** CTA chỉ dùng `ROUTES` hiện có: đăng ký/đăng nhập, boards, tasks, calendar, help, knowledge và AI unavailable.

- [ ] **Step 1: Viết test thất bại** — mọi CTA interactive có route đích thuộc flow thật hoặc AI unavailable; không có `to={ROUTES.UNDER_DEVELOPMENT}` ngoài AI.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/components/landing/__tests__/LandingNavigation.test.tsx`.
- [ ] **Step 3: Sửa mapping CTA** — chuyển view tasks/calendar/boards tới route thật; landing auth CTA tới Login/Register; footer product links tới section/Help phù hợp.
- [ ] **Step 4: Chạy test qua và kiểm tra source** — tests trên; `rg -n "ROUTES\.UNDER_DEVELOPMENT" src/components src/pages` chỉ được trả về AI-specific usage.
- [ ] **Step 5: Commit** — `fix(navigation): remove dead-end demo links`.
