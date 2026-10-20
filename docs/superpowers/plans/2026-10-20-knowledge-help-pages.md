# Knowledge Base, Help and 404 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay các route Knowledge Base/Help đang mở trang chung “Feature Under Development” bằng thư viện demo chỉ đọc, FAQ và trang 404 riêng.

**Architecture:** Tách dữ liệu mẫu thành fixture phía FE, trang Knowledge Base lọc/tìm/xem nội dung cục bộ, Help render tài liệu tĩnh. Router chỉ đưa AI route vào trang trạng thái ngoài phạm vi; mọi URL sai dùng NotFoundPage.

**Tech Stack:** React 18, React Router, TypeScript, Tailwind, Lucide, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-20-demo-ready-fe-design.md`

## Global Constraints

- Không sửa backend, API contract, database schema hoặc migration.
- Nội dung Knowledge Base mẫu phải hiển thị nhãn `Demo content`.
- Knowledge Base/Help không có thao tác tạo, sửa, xóa hay request ghi.
- AI Assistant/AI Agents nằm ngoài phạm vi và vẫn được đánh dấu rõ chưa triển khai.
- Không thêm dependency UI hoặc i18n runtime; không commit thay đổi có trước.

## Review Focus

- Search không phân biệt hoa thường và xử lý chuỗi rỗng — test tìm kiếm.
- Category không khớp có empty state và nút clear — test bộ lọc.
- Bài viết chi tiết vẫn có nhãn Demo và có nút quay lại — test mở/đóng.
- FAQ keyboard-operable — test button/expanded state.
- Unknown protected/public URL không bị chuyển nhầm thành tính năng chưa triển khai — test route.

---

### Task 1: Tạo fixture và thư viện Knowledge Base chỉ đọc

**Files:**
- Create: `src/types/knowledge-base.ts`
- Create: `src/mocks/data/knowledge-base.mock.ts`
- Create: `src/pages/knowledge/KnowledgeBasePage.tsx`
- Test: `src/pages/knowledge/__tests__/KnowledgeBasePage.test.tsx`

**Interfaces:** `KnowledgeBaseArticle` gồm `{ id; title; category; summary; content; updatedAt; readMinutes }`; fixture export `KNOWLEDGE_BASE_ARTICLES: KnowledgeBaseArticle[]`.

- [ ] **Step 1: Viết test thất bại** — kiểm tra nhãn Demo, search title/summary/content, lọc category, empty/reset, mở/đóng bài chi tiết; xác nhận không có nút ghi dữ liệu.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/pages/knowledge/__tests__/KnowledgeBasePage.test.tsx`.
- [ ] **Step 3: Cài đặt fixture và trang** — dùng dữ liệu hướng dẫn Nexora minh họa được board/card/workspace; mọi record đều có nhãn Demo.
- [ ] **Step 4: Chạy test qua** — chạy test trang và kiểm tra keyboard focus.
- [ ] **Step 5: Commit** — `feat(docs): add read-only knowledge library`; stage fixture, type, page và test.

### Task 2: Tạo Help & Docs với FAQ và liên kết Core

**Files:**
- Create: `src/pages/help/HelpPage.tsx`
- Create: `src/pages/help/help-content.ts`
- Test: `src/pages/help/__tests__/HelpPage.test.tsx`

**Interfaces:** `HELP_FAQS` là danh sách `{ question: string; answer: string }`; quick links dùng `ROUTES` hiện hành.

- [ ] **Step 1: Viết test thất bại** — xác nhận hướng dẫn Workspace/Board/Task/Membership, FAQ mở bằng bàn phím và quick links đi đúng route.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/pages/help/__tests__/HelpPage.test.tsx`.
- [ ] **Step 3: Cài đặt trang Help** — nội dung static, không gọi API; trình bày guide cards và FAQ accordion.
- [ ] **Step 4: Chạy test qua** — chạy HelpPage tests và `npm run typecheck`.
- [ ] **Step 5: Commit** — `feat(help): add product guides and FAQ`.

### Task 3: Tạo 404 và nối route Knowledge/Help

**Files:**
- Create: `src/pages/NotFoundPage.tsx`
- Test: `src/pages/__tests__/NotFoundPage.test.tsx`
- Modify: `src/routes.tsx`, `src/constants/routes.ts`

**Interfaces:** `/knowledge` render `KnowledgeBasePage`; `/help` render `HelpPage`; `/assistant` giữ `UnderDevelopmentPage`; route `*` render `NotFoundPage`.

- [ ] **Step 1: Viết test thất bại** — route integration assertions cho ba route mới/ngoài phạm vi và URL lạ; NotFound có link Home/Boards.
- [ ] **Step 2: Xác nhận test thất bại** — `npm exec vitest run src/pages/__tests__/NotFoundPage.test.tsx`.
- [ ] **Step 3: Cập nhật route map** — đặt catch-all cuối router; không đổi auth guard của routes hiện tại.
- [ ] **Step 4: Chạy test qua** — `npm exec vitest run src/pages/knowledge src/pages/help src/pages/__tests__/NotFoundPage.test.tsx`.
- [ ] **Step 5: Commit** — `feat(routes): add help knowledge and not found pages`.
