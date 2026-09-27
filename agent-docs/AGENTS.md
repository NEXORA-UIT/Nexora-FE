# Nexora Frontend — Agent Instructions

## 1. Purpose

This document defines the mandatory engineering rules for the Nexora frontend.

It applies to every AI coding agent working in this repository, including:

- Antigravity
- Codex
- Any future coding agent

There must be no agent-specific architecture.

All agents must produce code that follows the same repository conventions.

---

## 2. Source of Truth

Before modifying code:

1. Read this file.
2. Read the relevant documentation in `agent-docs/`.
3. Inspect the existing implementation.
4. Inspect existing reusable components, hooks, API modules, types, schemas, and stores.
5. Verify the relevant requirements before introducing business behavior.

The SRS and approved project requirements are the source of truth for business rules.

Do not invent business rules.

Do not silently change domain terminology.

---

## 3. General Rules

### MUST

- Follow the existing architecture.
- Reuse existing components.
- Reuse existing API modules.
- Follow the Design System.
- Use TypeScript strictly.
- Keep components focused.
- Keep business logic outside presentational components when practical.
- Follow API conventions.
- Follow state-management conventions.
- Handle loading, empty, error, and permission states.
- Keep changes within the requested scope.

### MUST NOT

- Rewrite the architecture without explicit approval.
- Create duplicate components.
- Create duplicate API clients.
- Create duplicate state stores.
- Add arbitrary colors.
- Add arbitrary spacing values.
- Add gradients.
- Put API calls directly inside components.
- Use Zustand for server state.
- use `any` unnecessarily.
- Refactor unrelated files.
- Change backend contracts without explicit agreement.
- Introduce software-development-specific assumptions into the general PM domain.

---

## 4. Before Creating Anything

Before creating a new file:

1. Search for an existing equivalent.
2. Determine whether the existing implementation can be reused.
3. Determine whether the functionality belongs to an existing module.
4. Only create a new abstraction when it provides clear value.

Avoid duplicate abstractions.

---

## 5. Scope Control

Implement only what the current task requires.

Do not:

- redesign unrelated screens
- rename unrelated files
- change global architecture
- replace libraries
- refactor unrelated components
- introduce new design patterns without need

A feature task must not become a repository-wide refactor.

---

## 6. Domain Boundary

Nexora is a general project management platform.

Core hierarchy:

Workspace
→ Board
→ List
→ Card
→ Task

Do not assume that Nexora is a software-development-only platform.

GitHub integration is optional.

---

## 7. Permission Boundary

Frontend permission checks exist for user experience.

They are not a security boundary.

Backend authorization remains authoritative.

Do not assume:

- being an Assignee means ownership
- being a Workspace member means access to every Board
- System Admin automatically has project-content access

Respect the permission model defined by the backend and SRS.

---

## 8. AI Agent Boundary

The AI Agent must respect:

- user permissions
- Board/Workspace boundaries
- approved tools
- structured output
- human approval for proposed write operations

Do not implement direct AI mutations without an explicit approved workflow.

---

## 9. Verification

After meaningful changes, verify:

- TypeScript
- ESLint
- formatting
- relevant tests
- application build

Do not claim a task is complete without verification.

---

## 10. Documentation Priority

When making frontend decisions, use this priority:

1. Approved project/SRS requirements
2. `AGENTS.md`
3. Relevant `agent-docs/*.md`
4. Existing architecture
5. Existing implementation patterns
6. General engineering judgment

If requirements are ambiguous, do not invent a business rule.

Document the assumption or ask for clarification.
