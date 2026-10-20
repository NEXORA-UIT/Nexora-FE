# English UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm mới đồng bộ toàn bộ giao diện Nexora FE và chuyển mọi app-provided UI copy sang tiếng Anh mà không đổi nghiệp vụ hoặc API.

**Architecture:** Giữ React/Tailwind và các UI primitives hiện có, bổ sung một `PageHeader` nhỏ dùng chung cho các route phù hợp và một helper trình bày lỗi API bằng tiếng Anh. Copy theo từng tính năng vẫn đặt cạnh component; không thêm runtime i18n hoặc thay đổi backend.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest, React Testing Library, Vite.

**Spec:** `docs/superpowers/specs/2026-10-20-english-ui-refresh-design.md`

## Global Constraints

- Giao diện English-only; không thêm `i18next` hoặc runtime chọn locale.
- Dùng lại palette, typography, radius, spacing và component primitives hiện có của Nexora.
- Giữ nguyên API payload/error code, quyền, validation nghiệp vụ và hành vi hiện có.
- Giữ nguyên tên riêng, dữ liệu động, nội dung người dùng tạo và dữ liệu demo.
- Không thêm queue, Socket.IO, AI, RAG, Agent hoặc chức năng mới.
- Không stage hoặc commit các hunk đã tồn tại trước plan; kiểm tra staged diff trước mọi commit.

## Review Focus

- Lỗi API có message tiếng Việt hoặc code chưa biết phải hiển thị fallback tiếng Anh — test trong Task 1.
- Validation server trả chi tiết tiếng Việt không được rò nguyên văn vào form — test trong Task 2.
- Workspace/Board trống hoặc tải lỗi vẫn có hành động tiếp theo và copy tiếng Anh — test trong Task 3.
- Restyle không làm hỏng kéo thả cùng cột hay drop vào cột rỗng — chạy test DnD trong Task 4.
- Viewport hẹp và thao tác bàn phím vẫn đọc được tên control, focus và actions — test component ở Task 1, smoke test cuối ở Task 6.

---

### Task 1: Dùng chung page header và chuyển lỗi API ở ranh giới giao diện

**Files:**

- Create: `src/components/ui/PageHeader.tsx`
- Create: `src/components/ui/__tests__/PageHeader.test.tsx`
- Create: `src/utils/api-error-message.ts`
- Create: `src/utils/__tests__/api-error-message.test.ts`
- Modify: `src/utils/index.ts`

**Interfaces:**

- `PageHeader` nhận `{ title: string; description?: string; actions?: React.ReactNode; eyebrow?: React.ReactNode; }` và render heading, mô tả, actions có layout responsive.
- `getUserFacingApiError(error: unknown, fallback: string): string` ưu tiên map theo code; nếu chưa biết thì map các status phổ biến (`401`, `403`, `404`, `409`, `429`, `5xx`) hoặc trả `fallback`. Không trả nguyên `ApiError.message`/`details` từ server.

- [ ] **Step 1: Viết test thất bại cho header và error mapper**

Trong `PageHeader.test.tsx`, kiểm tra title/description/actions được render và actions vẫn truy cập được ở layout hẹp. Trong `api-error-message.test.ts`, kiểm tra `INVALID_CREDENTIALS` có câu tiếng Anh, status `403` có câu quyền truy cập tiếng Anh, code không biết với server message tiếng Việt trả fallback, và lỗi thường không làm lộ message tiếng Việt.

- [ ] **Step 2: Chạy test mục tiêu để xác nhận thất bại**

Run: `npm exec vitest run src/components/ui/__tests__/PageHeader.test.tsx src/utils/__tests__/api-error-message.test.ts`
Expected: FAIL vì component/helper chưa tồn tại.

- [ ] **Step 3: Tạo `PageHeader` và `getUserFacingApiError`**

Dùng các class hiện có của app; `getUserFacingApiError` chỉ ánh xạ các code/status phổ biến và dùng `fallback` cho lỗi khác. Export helper từ `src/utils/index.ts`.

- [ ] **Step 4: Chạy lại test mục tiêu**

Run: `npm exec vitest run src/components/ui/__tests__/PageHeader.test.tsx src/utils/__tests__/api-error-message.test.ts`
Expected: PASS.

- [ ] **Step 5: Rà lại staged diff trước khi commit phần mới**

Chỉ commit các file Task 1; nếu một file đã có thay đổi trước plan thì stage riêng hunk mới hoặc để Task 1 chưa commit, không đưa thay đổi cũ vào. Commit message: `feat(ui): add shared header and English API errors`.

### Task 2: Làm mới public, Auth và Profile/Settings

**Files:**

- Modify: `src/pages/LandingPage.tsx`
- Modify: `src/components/landing/LandingNavbar.tsx`, `LandingHero.tsx`, `LandingAiDarkSection.tsx`, `LandingTeamsSection.tsx`, `LandingBentoGrid.tsx`, `LandingStatsAndQuotes.tsx`, `LandingEcosystem.tsx`, `LandingCta.tsx`, `LandingFooter.tsx`, `LandingPillars.tsx`, `LandingSummaryCards.tsx`, `LandingFeatureDetail.tsx`, `MockKanbanBoard.tsx`
- Modify: `src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `VerifyEmailPage.tsx`, `OAuthCallbackPage.tsx`
- Modify: `src/layouts/AuthLayout.tsx`
- Modify: `src/components/auth/AuthBackground.tsx`, `AuthCard.tsx`, `AuthStepIndicator.tsx`, `ForgotPasswordForm.tsx`, `ForgotPasswordSuccess.tsx`, `LoginForm.tsx`, `OAuthButtons.tsx`, `PasswordStrengthMeter.tsx`, `RegisterForm.tsx`, `ResetPasswordForm.tsx`, `ResetPasswordSuccess.tsx`
- Modify: `src/pages/settings/SettingsPage.tsx`, `src/pages/profile/ProfilePage.tsx`, `src/components/profile/ProfileInformationCard.tsx`, `ChangePasswordCard.tsx`, `AvatarSection.tsx`
- Test: `src/components/auth/__tests__/auth.flow.test.tsx`, `src/components/auth/__tests__/oauth.flow.test.tsx`; create `src/components/profile/__tests__/ProfileInformationCard.test.tsx`

**Interfaces:** Dùng `PageHeader` từ Task 1 ở các trang phù hợp; form giữ nguyên schema và callback API hiện có.

- [ ] **Step 1: Cập nhật test copy và validation trước khi đổi giao diện**

Sửa auth flow tests để xác nhận các trạng thái đăng nhập/đăng ký hiển thị tiếng Anh. Thêm test gửi `ApiError` có validation detail tiếng Việt và xác nhận field message không rò nguyên văn; thêm profile test xác nhận label/actions tiếng Anh và tên người dùng có dấu vẫn giữ nguyên.

- [ ] **Step 2: Chạy test để ghi nhận các assertion chưa đạt**

Run: `npm exec vitest run src/components/auth/__tests__/auth.flow.test.tsx src/components/auth/__tests__/oauth.flow.test.tsx src/components/profile/__tests__/ProfileInformationCard.test.tsx`
Expected: test validation detail mới FAIL trước khi cập nhật; các test khác bảo đảm flow hiện hữu.

- [ ] **Step 3: Làm mới các màn public/Auth/Profile**

Thống nhất hierarchy, khoảng cách, form feedback, CTA và responsive trên các component đã liệt kê. Thay app copy/validation/toast/aria text sang tiếng Anh; không dịch nội dung động hoặc đổi OAuth/auth flow.

- [ ] **Step 4: Chạy test Auth/Profile**

Run: `npm exec vitest run src/components/auth/__tests__/auth.flow.test.tsx src/components/auth/__tests__/oauth.flow.test.tsx src/components/profile/__tests__/ProfileInformationCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Rà và commit riêng phần public/Auth/Profile**

Kiểm tra staged diff để bảo toàn mọi hunk tồn tại trước plan; commit chỉ các hunk của Task 2. Commit message: `style(ui): refresh landing auth and profile`.

### Task 3: Làm mới app shell, dashboard, Boards và Workspace membership

**Files:**

- Modify: `src/layouts/AppLayout.tsx`
- Modify: `src/components/navigation/Topbar.tsx`, `Sidebar.tsx`, `UserMenu.tsx`
- Modify: `src/pages/HomePage.tsx`, `src/components/dashboard/HomeGreeting.tsx`, `MyWorkSection.tsx`, `UpcomingSection.tsx`, `ContinueWorkingSection.tsx`, `AiInsightCard.tsx`
- Modify: `src/pages/boards/BoardsPage.tsx`, `src/components/boards/BoardToolbar.tsx`, `BoardEmptyState.tsx`, `BoardCard.tsx`, `BoardCardSkeleton.tsx`, `ArchivedBoardCard.tsx`, `BoardActionMenu.tsx`, `CreateBoardModal.tsx`, `ConfirmDeleteBoardDialog.tsx`
- Modify: `src/components/workspace/CreateWorkspaceModal.tsx`, `WorkspaceHeader.tsx`, `WorkspaceTabs.tsx`, `WorkspaceMembersPanel.tsx`, `src/pages/workspaces/WorkspaceInvitationPage.tsx`, `src/hooks/useWorkspaceMembership.ts`
- Test: `src/pages/boards/__tests__/BoardsPage.workspace.test.tsx`, `src/components/workspace/__tests__/WorkspaceMembersPanel.test.tsx`, `src/pages/workspaces/__tests__/WorkspaceInvitationPage.test.tsx`

**Interfaces:** Các page header dùng `PageHeader`; lỗi membership dùng `getUserFacingApiError` với fallback theo thao tác.

- [ ] **Step 1: Cập nhật test của Workspace/Boards để chốt hành vi và copy tiếng Anh**

Assert invitation success/error, workspace member actions, empty workspace/Board state và thao tác tạo/chọn Workspace bằng English copy. Mock API error có `message` tiếng Việt để xác nhận fallback tiếng Anh; giữ assertion về Owner, membership và quyền hiện tại.

- [ ] **Step 2: Chạy test nhóm Workspace/Boards trước khi sửa**

Run: `npm exec vitest run src/pages/boards/__tests__/BoardsPage.workspace.test.tsx src/components/workspace/__tests__/WorkspaceMembersPanel.test.tsx src/pages/workspaces/__tests__/WorkspaceInvitationPage.test.tsx`
Expected: các assertion copy mới FAIL, assertion nghiệp vụ hiện tại vẫn qua.

- [ ] **Step 3: Làm mới shell/dashboard/Boards/Workspace**

Chuẩn hóa điều hướng, page header, card/list hierarchy, membership/invitation forms và empty/error/loading states. Chuyển app copy và toast/confirm/aria-label sang tiếng Anh; giữ nguyên quyền và API calls.

- [ ] **Step 4: Chạy test nhóm Workspace/Boards**

Run: `npm exec vitest run src/pages/boards/__tests__/BoardsPage.workspace.test.tsx src/components/workspace/__tests__/WorkspaceMembersPanel.test.tsx src/pages/workspaces/__tests__/WorkspaceInvitationPage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Rà staged diff và commit riêng nhóm shell/workspace**

Không stage file nguyên vẹn nếu trong đó có hunk cũ ngoài Task 3. Commit message: `style(ui): refresh workspace and dashboard`.

### Task 4: Làm mới Board detail, Kanban, Card detail, planning và tích hợp

**Files:**

- Modify: `src/pages/boards/BoardDetailPage.tsx`
- Modify: `src/components/kanban/BoardDetailHeader.tsx`, `BoardDetailToolbar.tsx`, `BoardMembersDialog.tsx`, `GitHubConfigModal.tsx`, `KanbanBoard.tsx`, `KanbanColumn.tsx`, `KanbanCard.tsx`, `KanbanColumnSkeleton.tsx`, `AddCardInline.tsx`, `AddColumnInline.tsx`, `CardPriorityBadge.tsx`, `CardTagBadge.tsx`
- Modify: `src/components/kanban/detail/CardDetailDrawer.tsx`, `CardDetailHeader.tsx`, `CardDetailMetadata.tsx`, `CardDetailDescription.tsx`, `CardDetailChecklist.tsx`, `CardDetailDependencies.tsx`, `CardDetailAttachments.tsx`, `CardDetailActivity.tsx`
- Modify: `src/components/kanban/detail/activity/CardGitActivityTab.tsx`
- Modify: `src/components/kanban/calendar/BoardCalendar.tsx`, `CalendarToolbar.tsx`, `CalendarMonthView.tsx`, `CalendarDayCell.tsx`, `CalendarAgendaView.tsx`, `CalendarCardChip.tsx`
- Modify: `src/components/kanban/planning/BoardPlanningView.tsx`, `AddDependencyDialog.tsx`, `PlanningDependencyOverview.tsx`, `PlanningDashboardMetrics.tsx`, `PlanningScheduleWarnings.tsx`, `src/hooks/useBoardDetail.ts`
- Test: `src/components/kanban/__tests__/BoardDetailToolbar.test.tsx`, `BoardMembersDialog.test.tsx`, `GitHubConfigModal.test.tsx`, `src/components/kanban/__tests__/KanbanColumn.dnd.test.tsx`, `src/hooks/__tests__/useKanbanDnd.test.tsx`, Card detail/planning/calendar tests under their existing `__tests__` directories

**Interfaces:** Dùng shared header/error helper từ Task 1; không thay đổi props nghiệp vụ hoặc API callback của các component.

- [ ] **Step 1: Cập nhật test cho các filter/dialog và trạng thái Card quan trọng**

Assert toolbar filter, Board membership, GitHub dialog và Card detail có English labels/actions; mock lỗi API tiếng Việt và xác nhận UI dùng English fallback; giữ nguyên kiểm tra quyền. Giữ nguyên regression tests cho same-list reorder và drop vào cột rỗng.

- [ ] **Step 2: Chạy test mục tiêu trước khi đổi UI**

Run: `npm exec vitest run src/components/kanban/__tests__/BoardDetailToolbar.test.tsx src/components/kanban/__tests__/BoardMembersDialog.test.tsx src/components/kanban/__tests__/GitHubConfigModal.test.tsx src/components/kanban/__tests__/KanbanColumn.dnd.test.tsx src/hooks/__tests__/useKanbanDnd.test.tsx src/components/kanban/detail/__tests__ src/components/kanban/calendar/__tests__ src/components/kanban/planning/__tests__`
Expected: test copy mới FAIL; test nghiệp vụ/DnD hiện tại PASS.

- [ ] **Step 3: Làm mới Board/Card surfaces và thông báo lỗi**

Chuẩn hóa toolbar, dialog, Card detail sections, calendar/planning surfaces và responsive states; đổi copy, xác nhận, toast và aria text sang tiếng Anh. Giữ nguyên DnD registry/collision, permissions, OCC và API calls.

- [ ] **Step 4: Chạy lại Board/Card regression tests**

Run: lệnh Vitest ở Step 2.
Expected: PASS, bao gồm drag reorder và drop vào list rỗng.

- [ ] **Step 5: Rà staged diff và commit riêng Board/Card UI**

Chỉ stage các hunk Task 4; tuyệt đối không gom các thay đổi API/domain tồn tại trước plan. Commit message: `style(ui): refresh board and card interfaces`.

### Task 5: Làm mới My Tasks, Workspace Calendar và Quick Notes

**Files:**

- Modify: `src/pages/tasks/MyTasksPage.tsx`, `src/hooks/useMyTasks.ts`
- Modify: `src/pages/calendar/WorkspaceCalendarPage.tsx`, `src/hooks/useWorkspaceCalendar.ts`
- Modify: `src/pages/quick-notes/QuickNotesPage.tsx`, `src/hooks/useQuickNotes.ts`
- Modify: `src/pages/UnderDevelopmentPage.tsx`
- Test: `src/pages/tasks/__tests__/MyTasksPage.test.tsx`; create `src/pages/calendar/__tests__/WorkspaceCalendarPage.test.tsx` and `src/pages/quick-notes/__tests__/QuickNotesPage.test.tsx`

**Interfaces:** Dùng `PageHeader` và `getUserFacingApiError` từ Task 1; không đổi hook return types hoặc API behavior.

- [ ] **Step 1: Viết/điều chỉnh page tests cho filters, empty/error state và thao tác chính**

Kiểm tra task filtering, calendar workspace/board selection, Quick Note create/edit/delete/convert; assert các labels, confirmations và states bằng tiếng Anh, đồng thời xác nhận dữ liệu động giữ nguyên.

- [ ] **Step 2: Chạy tests trước khi cập nhật pages**

Run: `npm exec vitest run src/pages/tasks/__tests__/MyTasksPage.test.tsx src/pages/calendar/__tests__/WorkspaceCalendarPage.test.tsx src/pages/quick-notes/__tests__/QuickNotesPage.test.tsx`
Expected: test mới/copy mới FAIL trước khi triển khai.

- [ ] **Step 3: Làm mới ba work-management pages**

Chuẩn hóa headers, filters, summary/content surfaces và loading/empty/error states; chuyển UI copy trong pages/hooks sang tiếng Anh, giữ nguyên semantics filter và mutations.

- [ ] **Step 4: Chạy lại page tests**

Run: lệnh Vitest ở Step 2.
Expected: PASS.

- [ ] **Step 5: Rà staged diff và commit riêng work-management UI**

Chỉ stage hunk Task 5, giữ các thay đổi đã tồn tại trước plan ngoài commit. Commit message: `style(ui): refresh tasks calendar and notes`.

### Task 6: Rà toàn bộ English copy, responsive và xác nhận tích hợp

**Files:**

- Modify tests cập nhật trong `src/**/__tests__/**`.
- Modify production UI/hook/schema files còn app-provided tiếng Việt sau Tasks 1–5.
- Không chỉnh `src/mocks/**`, user/project dynamic data, hoặc backend.

**Interfaces:** Không thêm interface mới; đây là audit và verification trên các module đã hoàn thiện.

- [ ] **Step 1: Thêm assertion audit copy cho route đại diện**

Đảm bảo test route/component của Landing, Auth, Dashboard, Boards, Workspace membership, Board/Card detail, Tasks, Calendar, Quick Notes và Settings kiểm tra title/action/state bằng English copy.

- [ ] **Step 2: Chạy test toàn bộ trước khi sửa các chuỗi sót**

Run: `npm test`
Expected: report chỉ ra các assertion copy chưa đồng bộ; không có lỗi nghiệp vụ mới.

- [ ] **Step 3: Rà production source và sửa app copy còn tiếng Việt**

Tìm chuỗi tiếng Việt trong `src` production code, kiểm tra thủ công từng hit, dịch app copy còn sót gồm Zod/UI validation, toast, confirm, aria/title, fallback/error và format ngày. Giữ nguyên tên riêng/dữ liệu động và tên người trong dữ liệu demo.

- [ ] **Step 4: Chạy verification đầy đủ**

Run lần lượt: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
Expected: tất cả lệnh exit 0; chỉ chấp nhận warning bundle đã tồn tại nếu build vẫn thành công.

- [ ] **Step 5: Smoke test desktop và viewport hẹp**

Mở các nhóm route đại diện, kiểm tra không tràn chữ, dialog/filter thao tác được, focus/aria còn đúng, dynamic data không bị dịch và DnD hoạt động. Chụp/ghi nhận lỗi rồi sửa trước khi hoàn tất.

- [ ] **Step 6: Rà diff tổng và commit phần audit nếu an toàn**

Kiểm tra `git diff --check`, staged diff và trạng thái working tree. Không commit các hunk ngoài plan; nếu không thể cô lập an toàn khỏi thay đổi cũ, để các hunk đó unstaged để bro review. Nếu có hunk audit độc lập để commit, dùng `fix(ui): complete English copy audit`.
