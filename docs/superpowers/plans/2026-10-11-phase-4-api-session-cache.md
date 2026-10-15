# Phase 4: API Client, Session Lifecycle & Cache Hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden API client error & refresh queue concurrency, eliminate session restoration race conditions on tab account changes, implement a bounded LRU cache for workspace members, clean up dead fallbacks/logs, and require explicit workspace identifiers.

**Architecture:**
1. Re-entrance safe queue draining in `client.ts` with normalized `ApiError` propagation for all queued requests upon refresh failure.
2. Token-scoped session revalidation with stale response guards in `useSession.ts` to prevent race conditions during account switches or logouts in the same tab.
3. Map-based 50-item bounded LRU cache with active TTL checks and touch-on-read order updates in `workspace.api.ts`.
4. Strict mandatory `workspaceId` typing in `board.api.ts` removing hardcoded default fallbacks, removal of dead `{children ?? <Outlet />}` fallback in `AppLayout.tsx`, and removal of raw `console.error` calls in `useWorkspaceBoards.ts`.

**Tech Stack:** React 18, TypeScript, Axios, Zustand, Vitest, Testing Library React.

**Spec:** [FRONTEND_CODEBASE_AUDIT.md](file:///d:/Document/T%C3%80I%20LI%E1%BB%86U%20%C4%90%E1%BB%92%20%C3%81N%201/Nexora/FRONTEND_CODEBASE_AUDIT.md) — Findings F-005, F-006, F-009, F-010, F-011, F-015.

## Global Constraints

- No changes to Backend endpoints, database schema, or API contracts.
- Do not migrate to TanStack React Query in this phase.
- Stage only explicit file paths; never use `git add .` or `git add -A`.
- Do not push, reset, amend, or switch branches.
- F-018 (`formatFileSize`) is deferred to the final polish phase.

## Review Focus

1. Refresh token failure in `client.ts`: All queued requests must be rejected with `ApiError`, `failedQueue` emptied, `isRefreshing` set to `false`, and no hanging promises.
2. Concurrent 401s in `client.ts`: Multiple concurrent 401 requests trigger exactly one refresh API call and all queued requests retry and resolve.
3. Account switch / logout in `useSession.ts`: If `getMe()` is in-flight when user logs out or switches accounts, the stale profile must be discarded and never overwrite the new session or re-clear auth.
4. Bounded LRU cache in `workspace.api.ts`: Cache size strictly limited to 50 items; accessing an item refreshes its LRU position; TTL (1 min) is honored and expired items are evicted.
5. Board API caller integrity in `board.api.ts`: No caller breaks when `getBoards(workspaceId: string)` parameter has no default.

---

### Task 1: F-006 — Refresh Token Queue Hardening and Concurrency in `client.ts`

**Files:**
- Modify: `src/apis/client.ts`
- Test: `src/apis/__tests__/client.test.ts`

**Interfaces:**
- Consumes: `useAuthStore` from `@/stores/auth.store`, `ApiError`, `transformAxiosError` from `@/apis/client`.
- Produces: Hardened `apiClient` interceptor with thread-safe queue processing and full `ApiError` normalization.

- [ ] **Step 1: Write failing test suite for token refresh queue in `src/apis/__tests__/client.test.ts`**

Covering:
- Attaching bearer token on request.
- Transparent refresh on 401 and retry.
- Multiple concurrent 401 requests trigger a single refresh call and all retry successfully.
- Refresh failure rejects all queued requests with normalized `ApiError` and clears auth store.
- Queued request failure after refresh is caught and rejected as `ApiError`.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/apis/__tests__/client.test.ts`
Expected: FAIL (file does not exist or test failures).

- [ ] **Step 3: Implement queue draining and error normalization in `src/apis/client.ts`**

- Drain `failedQueue` into local `const queue = failedQueue; failedQueue = [];` before iterating in `processQueue`.
- Ensure all items in `failedQueue` receive normalized `ApiError` when refresh fails.
- Guarantee in `finally` that `isRefreshing = false` and any unexpected queued promises are rejected.
- Chain `.catch` on retried requests to ensure errors are normalized to `ApiError`.

- [ ] **Step 4: Run tests to verify all pass**

Run: `npx vitest run src/apis/__tests__/client.test.ts`
Expected: PASS all tests in `client.test.ts`.

- [ ] **Step 5: Verify no regression across existing tests**

Run: `npx vitest run src/apis/__tests__/`
Expected: All API tests PASS.

---

### Task 2: F-010 — Session Restoration Lifecycle and Stale Response Guards in `useSession.ts`

**Files:**
- Modify: `src/hooks/useSession.ts`
- Test: `src/hooks/__tests__/useSession.test.ts`

**Interfaces:**
- Consumes: `useAuthStore` from `@/stores/auth.store`, `authApi.getMe()` from `@/apis/auth.api`.
- Produces: `useSession(): { isValidating: boolean }` with stale response guard and account-switch support.

- [ ] **Step 1: Write failing test suite in `src/hooks/__tests__/useSession.test.ts`**

Covering:
- Initial mount with tokens calls `authApi.getMe()` and updates `setUser(profile)`.
- Mount without tokens does not call `authApi.getMe()`.
- Token change in same tab (new login or account switch) triggers re-validation.
- Stale response guard: If user logs out while `getMe()` is pending, resolved profile is discarded and does not overwrite user state.
- Stale response guard: If user switches account while `getMe()` is pending, User 1's profile does not overwrite User 2's session.
- Failure in `getMe()` only clears auth if the session being validated is still the active session in store.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/hooks/__tests__/useSession.test.ts`
Expected: FAIL (file does not exist or failure on account-switch / race conditions).

- [ ] **Step 3: Implement token-scoped validation and race condition guards in `src/hooks/useSession.ts`**

- Replace `hasRestored` boolean ref with `validatedSessionRef = React.useRef<string | null>(null)`.
- If `!accessToken && !refreshToken`: set `validatedSessionRef.current = null; return;`.
- If `validatedSessionRef.current === (refreshToken || accessToken)`: return early (already validated).
- Capture `const initialRefreshToken = refreshToken; const initialAccessToken = accessToken;`.
- In `restoreSession()` resolution: verify `const state = useAuthStore.getState();` matches `initialRefreshToken` and is not null before calling `setUser(profile)`.
- In `catch`: verify `state.refreshToken === initialRefreshToken` before calling `clearAuth()`.

- [ ] **Step 4: Run tests to verify all pass**

Run: `npx vitest run src/hooks/__tests__/useSession.test.ts`
Expected: PASS all tests in `useSession.test.ts`.

- [ ] **Step 5: Run auth flow integration tests**

Run: `npx vitest run src/components/auth/__tests__/auth.flow.test.tsx`
Expected: PASS.

---

### Task 3: F-009 — Bounded LRU Cache (Max 50) with Active TTL in `workspace.api.ts`

**Files:**
- Modify: `src/apis/workspace.api.ts`
- Test: `src/apis/__tests__/workspace.api.test.ts`

**Interfaces:**
- Consumes: `apiClient` from `@/apis/client`, `useAuthStore` from `@/stores/auth.store`.
- Produces: `workspaceApi.listWorkspaceMembers` with LRU eviction at 50 items and active TTL touch-on-read.

- [ ] **Step 1: Write failing tests in `src/apis/__tests__/workspace.api.test.ts`**

Add tests for:
- LRU touch-on-read: Reading an item refreshes its position so it is not evicted before unread items.
- LRU eviction: Adding 51 items evicts the least recently accessed item.
- TTL expiration: Item past 60s TTL is evicted and re-fetched from network.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/apis/__tests__/workspace.api.test.ts`
Expected: FAIL on the new LRU eviction and access re-ordering assertions.

- [ ] **Step 3: Implement Bounded LRU cache logic in `src/apis/workspace.api.ts`**

- Define `const MAX_WORKSPACE_MEMBERS_CACHE_ENTRIES = 50;`.
- On read hit: if expired (`Date.now() - cached.timestamp >= CACHE_TTL_MS`), delete from Map. If valid, `workspaceMembersCache.delete(cacheKey); workspaceMembersCache.set(cacheKey, cached);` to reorder.
- On write: if key exists, delete first. Else if `size >= MAX_WORKSPACE_MEMBERS_CACHE_ENTRIES`, delete `workspaceMembersCache.keys().next().value`. Set new entry.

- [ ] **Step 4: Run tests to verify all pass**

Run: `npx vitest run src/apis/__tests__/workspace.api.test.ts`
Expected: PASS all tests in `workspace.api.test.ts`.

---

### Task 4: F-015 — Remove Default Parameter in `board.api.ts`

**Files:**
- Modify: `src/apis/board.api.ts`
- Test: `src/apis/__tests__/board.api.test.ts`

**Interfaces:**
- Consumes: `apiClient` from `@/apis/client`.
- Produces: `boardApi.getBoards(workspaceId: string, options?: ListBoardsQuery): Promise<Board[]>`.

- [ ] **Step 1: Update type signature and remove default parameter**

Change:
`async getBoards(workspaceId: string = "ws-core-platform", options?: ListBoardsQuery): Promise<Board[]>`
To:
`async getBoards(workspaceId: string, options?: ListBoardsQuery): Promise<Board[]>`

- [ ] **Step 2: Verify all callers and tests**

Run: `npx vitest run src/apis/__tests__/board.api.test.ts src/hooks/__tests__/useWorkspaceBoards.test.ts`
Expected: PASS.

---

### Task 5: F-005 & F-011 — Remove Raw `console.error` and Remove Dead Fallback in `AppLayout`

**Files:**
- Modify: `src/hooks/useWorkspaceBoards.ts`
- Modify: `src/layouts/AppLayout.tsx`

**Interfaces:**
- Consumes: React, react-router-dom `<Outlet />`.
- Produces: Clean `useWorkspaceBoards` hook without `console.error` leakage; clean `<AppLayout>` rendering `<Outlet />` directly.

- [ ] **Step 1: Remove `console.error` calls in `src/hooks/useWorkspaceBoards.ts`**

Remove line 224 (`console.error("Archive board failed:", err);`) and line 262 (`console.error("Restore board failed:", err);`).

- [ ] **Step 2: Clean up `<Outlet />` rendering in `src/layouts/AppLayout.tsx`**

Replace `{children ?? <Outlet />}` with `<Outlet />`. Preserve `AppLayoutProps` with optional `children` for typing compatibility.

- [ ] **Step 3: Run affected tests**

Run: `npx vitest run src/hooks/__tests__/useWorkspaceBoards.test.ts`
Expected: PASS.

---

### Task 6: Full Verification & Quality Gates

**Files:**
- Run full repository checks across the modified files.

- [ ] **Step 1: Run TypeScript typecheck**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 2: Run ESLint**

Run: `npm run lint`
Expected: 0 warnings, 0 errors.

- [ ] **Step 3: Run Full Vitest Suite**

Run: `npm test`
Expected: All test suites PASS (>500 tests).

- [ ] **Step 4: Run Production Build**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 5: Run Git Diff Check**

Run: `git diff --check`
Expected: Clean, no whitespace or conflict marker issues.
