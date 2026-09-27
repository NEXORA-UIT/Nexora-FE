# Nexora Frontend — Team Workflow

## 1. Team

The frontend is developed by two developers.

Developer A:

```text
Antigravity
```

Developer B:

```text
Codex
```

Both use the same repository.

Both must follow:

```text
AGENTS.md
```

and all relevant documentation.

There must be no separate architecture for each developer.

---

## 2. Current Phase

The current phase is:

```text
Frontend Foundation / Initialization
```

The current goal is to establish:

* project structure
* dependencies
* design tokens
* API architecture
* state management
* routing foundation
* mock infrastructure
* documentation
* code-quality tooling

Do not implement complete business use cases during initialization.

---

## 3. Use-Case Ownership

Use Cases will be divided later.

Do not permanently assign ownership during initialization.

When feature development begins, each Use Case should have a clear owner.

---

## 4. Feature Workflow

For each future Use Case:

```text
Requirement
    ↓
Inspect SRS
    ↓
Inspect API contract
    ↓
Inspect existing implementation
    ↓
Define affected files
    ↓
Implement
    ↓
Test
    ↓
Run lint/typecheck/build
    ↓
Review
    ↓
Merge
```

---

## 5. Before Coding

The developer/agent must:

1. Read `AGENTS.md`.
2. Read the relevant architecture documentation.
3. Identify the affected domain.
4. Inspect existing reusable components.
5. Inspect existing API modules.
6. Inspect types and schemas.
7. Determine whether mock API support is required.

---

## 6. Scope Control

A feature branch should contain only changes related to the assigned task.

Do not include:

* unrelated refactors
* unrelated formatting changes
* unrelated dependency changes
* redesigns of other features

---

## 7. Shared Files

Be careful when modifying shared files:

* routes.tsx
* global styles
* design tokens
* API client
* providers
* shared UI components
* shared types
* global constants

If a shared file must change, keep the change minimal and coordinate it.

---

## 8. Component Reuse

Before creating a new shared component:

1. Search existing components.
2. Determine whether it already exists.
3. Determine whether it should be extended.
4. Only create a new component when justified.

---

## 9. Design System

All features must follow:

```text
DESIGN_SYSTEM.md
```

Do not create feature-specific colors, spacing scales, or radius systems.

---

## 10. Backend Coordination

Frontend and backend are developed in parallel.

When an API is unavailable:

```text
Use MSW
```

Do not block UI development unnecessarily.

When the backend contract changes:

```text
Update API contract
→ Update types
→ Update mock handlers
→ Update API modules
→ Update affected consumers
```

---

## 11. Git

Use feature-oriented branches.

Example:

```text
feature/auth-login
feature/workspace-management
feature/board-management
feature/card-management
feature/task-management
```

Bug fixes:

```text
fix/board-loading-state
fix/task-validation
```

Do not use vague branch names such as:

```text
test
update
change
frontend
fix
```

---

## 12. Commit Messages

Prefer focused commits.

Examples:

```text
feat: initialize frontend architecture
feat: add workspace API contract
feat: add reusable dialog component
fix: handle board forbidden state
refactor: simplify task query hook
test: add card form validation tests
```

Avoid giant commits containing unrelated work.

---

## 13. Pull Requests

A PR should clearly state:

* what changed
* why it changed
* affected Use Case
* tests performed
* known limitations

---

## 14. Definition of Done

A feature is considered complete when:

* requirements are implemented
* existing architecture is respected
* Design System is respected
* API contract is respected
* loading/empty/error/permission states are handled where relevant
* TypeScript passes
* ESLint passes
* relevant tests pass
* no unrelated files were unnecessarily changed
