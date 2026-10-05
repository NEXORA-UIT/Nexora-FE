# Nexora Frontend — Coding Rules

## 1. TypeScript

Use strict TypeScript.

Avoid:

```ts
any
```

unless technically necessary and documented.

Prefer explicit domain types.

Do not hide type errors with:

```ts
as any
```

or excessive type assertions.

### Type Centralization Rule

Reusable domain, API request/response, DTO, entity, and shared types must live under `src/types/`. Components, pages, API modules, and stores should import these types rather than redefining them locally. Local types are allowed only when they are genuinely private implementation details of a single file.

---

## 2. Components

Components should have one clear responsibility.

Avoid giant components.

If a component becomes difficult to understand, consider extracting:

* subcomponents
* hooks
* utilities
* domain logic

Do not extract components purely to reduce line count.

---

## 3. JSX

Keep JSX focused on presentation and composition.

Avoid putting large business rules directly inside JSX.

Bad:

```tsx
{tasks
  .filter(...)
  .map(...)
  .sort(...)
  .filter(...)
  .map(...)}
```

Prefer preparing data through hooks or utilities.

---

## 4. API Calls

Never call:

```ts
fetch(...)
axios.get(...)
axios.post(...)
```

directly inside a React component.

Use:

```text
Component
→ Hook
→ TanStack Query
→ API module
```

---

## 5. Server State

Server state must normally use TanStack Query.

Do not duplicate API data into Zustand without a clear reason.

---

## 6. Naming

Components:

```text
PascalCase
```

Examples:

```text
BoardHeader.tsx
TaskCard.tsx
WorkspaceSwitcher.tsx
```

Hooks:

```text
useSomething.ts
```

Examples:

```text
useAuth.ts
useBoard.ts
useTaskFilters.ts
```

Utilities:

```text
kebab-case
```

Examples:

```text
format-date.ts
format-file-size.ts
```

---

## 7. Files

Prefer focused files.

Avoid:

```text
everything.ts
helpers.ts
common.ts
misc.ts
```

when they contain unrelated responsibilities.

---

## 8. Imports

Use the project's configured alias strategy consistently.

Avoid deeply nested relative imports when a configured alias is available.

---

## 9. Comments

Do not add comments for obvious code.

Good comments explain:

* non-obvious technical constraints
* temporary workarounds
* important architectural decisions

Bad comments explain:

```ts
// Set loading to true
setLoading(true);
```

---

## 10. Error Handling

Always consider:

* loading
* empty
* error
* unauthorized
* forbidden

Do not silently swallow errors.

---

## 11. Accessibility

Interactive controls must have:

* accessible labels where necessary
* keyboard accessibility
* visible focus states
* meaningful semantic elements

Do not use clickable `div` elements when a button or link is appropriate.

---

## 12. Styling

Use the Nexora Design System.

Do not invent:

* colors
* spacing
* radius
* gradients

Do not scatter arbitrary inline styles throughout components.

---

## 13. Refactoring

Refactor only when:

* required by the current task
* required to fix a real issue
* explicitly requested

Do not use feature work as an excuse for unrelated refactoring.

---

## 14. Dependencies

Before adding a package:

1. Check existing dependencies.
2. Determine whether the project already has an equivalent solution.
3. Confirm the dependency is necessary.
4. Avoid adding large libraries for trivial functionality.

---

## 15. Business Logic

Do not invent business behavior in the frontend.

When business behavior is unclear:

* inspect the requirements
* inspect the API contract
* document assumptions
* ask for clarification when necessary

---

## 16. Security

Never treat client-side validation or permission checks as sufficient security.

Backend validation and authorization remain authoritative.
