# Nexora Frontend — Component Rules

## 1. Component Layers

Use four main component layers.

```text
UI
↓
Common
↓
Navigation / Application
↓
Domain / Page composition
```

---

## 2. UI Components

Location:

```text
src/components/ui/
```

Examples:

* Button
* Input
* Select
* Dialog
* Dropdown
* Badge
* Avatar
* Tooltip
* Tabs
* Checkbox

UI components must remain generic.

They must not know about:

* Workspace
* Board
* Card
* Task
* API endpoints
* business permissions

unless the component is explicitly domain-specific.

---

## 3. Common Components

Location:

```text
src/components/common/
```

Examples:

* PageHeader
* EmptyState
* LoadingState
* ErrorState
* SearchInput
* Pagination

These may understand application-level concepts but should remain reusable.

---

## 4. Navigation Components

Location:

```text
src/components/navigation/
```

Examples:

* Sidebar
* Topbar
* Breadcrumb
* WorkspaceSwitcher
* UserMenu

---

## 5. Feedback Components

Location:

```text
src/components/feedback/
```

Examples:

* ConfirmDialog
* ErrorBoundary fallback
* operation feedback components

---

## 6. Domain Components

Domain-specific components may live near the relevant page/feature when appropriate.

Examples:

```text
BoardHeader
ListColumn
CardItem
TaskItem
MemberList
NotificationItem
```

Do not place domain components inside generic `ui/`.

---

## 7. Reuse Before Create

Before creating a component:

1. Search existing components.
2. Determine whether an existing component can be reused.
3. Extend the existing component if the requirement is generic.
4. Create a new component only when justified.

Never create:

```text
Button
PrimaryButton
BlueButton
ActionButton
SubmitButton
```

when one configurable Button component is sufficient.

---

## 8. Component Props

Props should be explicit and minimal.

Avoid passing entire unrelated objects when only a few fields are required.

---

## 9. Variants

For reusable UI variants, prefer a consistent variant approach.

Use:

```text
class-variance-authority
```

when it improves consistency.

Do not duplicate styling across variants.

---

## 10. Business Logic

Generic components must not contain domain business rules.

Example:

Bad:

```text
Button decides whether a user can edit a Card.
```

Better:

```text
Card feature determines permission.
Button only receives the appropriate state.
```

---

## 11. Loading / Empty / Error

Reusable data-display components should support appropriate states.

Do not make every page reinvent:

* skeleton
* empty state
* error state

---

## 12. Accessibility

Reusable interactive components must support:

* keyboard interaction
* focus states
* accessible labels
* disabled states
* semantic HTML

---

## 13. Visual Consistency

All reusable components must follow:

`DESIGN_SYSTEM.md`

No gradients.

No arbitrary colors.

No arbitrary spacing.

No arbitrary radius values.
