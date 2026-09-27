# Nexora Frontend — Testing

## 1. Testing Philosophy

Testing should focus on correctness of important behavior.

Do not pursue arbitrary 100% coverage.

Prioritize critical user flows and reusable components.

---

## 2. Unit / Component Testing

Use:

- Vitest
- React Testing Library

Test:

- reusable components
- validation logic
- utility functions
- important UI behavior
- permission-sensitive rendering

---

## 3. End-to-End Testing

Use:

```text
Playwright
```

for important user flows.

Examples:

* authentication flow
* Workspace navigation
* Board navigation
* Card interaction
* Task interaction
* important permission boundaries

---

## 4. API Mock Testing

MSW should be used where realistic API behavior is required.

Mock responses must follow:

```text
API_CONVENTIONS.md
```

---

## 5. What to Test

Prioritize:

### Authentication

* valid submission
* validation errors
* API errors
* unauthorized states

### Workspace

* loading
* empty state
* successful rendering
* permission-sensitive actions

### Board

* loading
* empty lists
* card rendering
* error states
* permission states

### Card / Task

* form validation
* mutation success
* mutation failure
* state updates

### Collaboration

* comments
* notifications
* important interaction states

---

## 6. Accessibility

Where practical, tests should verify accessible interaction.

Prefer semantic queries such as:

```text
getByRole
getByLabelText
getByText
```

rather than fragile selectors.

---

## 7. Test Naming

Tests should describe user-visible behavior.

Prefer:

```text
should show validation error when task title is empty
```

over:

```text
testTask1
```

---

## 8. Do Not Over-Test Implementation Details

Avoid tests that depend heavily on:

* internal component structure
* private implementation details
* exact class names

Prefer testing behavior.

---

## 9. Before Merge

Relevant tests must pass.

At minimum, verify:

* TypeScript
* ESLint
* relevant tests
* production build
