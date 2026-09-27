# Nexora Frontend — State Management

## 1. State Categories

Nexora uses four main state categories.

| State | Tool |
|---|---|
| Server state | TanStack Query |
| Client/UI state | Zustand |
| Form state | React Hook Form |
| URL state | React Router |

---

## 2. Server State

Use TanStack Query for:

- Workspace data
- Board data
- List data
- Card data
- Task data
- Members
- Comments
- Notifications
- Dashboard data
- Knowledge Base data
- AI responses when API-driven

Do not duplicate these datasets in Zustand without a strong reason.

---

## 3. Client State

Use Zustand for:

- sidebar state
- modal state
- drawer state
- UI preferences
- temporary local UI state
- selected UI context when it is not better represented by URL state

---

## 4. Form State

Use React Hook Form for forms.

Use Zod for validation.

Do not create large Zustand stores for form state.

---

## 5. URL State

Use React Router for state that should be represented in the URL.

Examples:

- board ID
- selected view
- search parameters
- filters when URL persistence is desired

---

## 6. Local Component State

Use React `useState` when state:

- belongs to one component
- does not need global access
- does not need server synchronization

Do not move every piece of local state into Zustand.

---

## 7. Derived State

Prefer deriving values from existing state instead of storing duplicated values.

Bad:

```text
tasks
completedTasks
completedTaskCount
```

when the latter values can safely be derived.

---

## 8. Mutations

Server mutations should use TanStack Query mutations.

After mutations:

* invalidate affected queries
* update cache carefully when appropriate
* handle success/error states

---

## 9. Optimistic Updates

Use optimistic updates only when:

* UX benefits materially
* rollback behavior is clear
* the backend behavior is understood

Do not introduce optimistic updates everywhere.

---

## 10. State Ownership

State should live at the lowest reasonable level.

Prefer:

```text
Local component state
```

before:

```text
Zustand
```

and prefer:

```text
TanStack Query
```

for server state.

---

## 11. Anti-Patterns

Avoid:

* server state in Zustand
* duplicated API caches
* global state for modal-local data
* giant global stores
* passing the same state through many unrelated component levels when a cleaner architecture exists
