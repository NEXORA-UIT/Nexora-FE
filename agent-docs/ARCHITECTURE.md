# Nexora Frontend — Architecture

## 1. Architecture Goal

The frontend architecture must support:

- React + TypeScript
- parallel frontend/backend development
- two developers
- Antigravity and Codex
- use-case-based future development
- reusable UI components
- API mocking
- clear separation of concerns
- scalable project management features

The architecture should remain simple enough for a two-student project.

---

## 2. Source Structure

```text
src/
├── apis/
├── assets/
├── components/
│   ├── ui/
│   ├── common/
│   ├── navigation/
│   └── feedback/
├── constants/
├── hooks/
├── layouts/
├── lib/
├── mocks/
│   ├── data/
│   └── handlers/
├── pages/
├── providers/
├── schemas/
├── stores/
├── styles/
├── types/
├── utils/
│
├── App.tsx
├── index.css
├── main.tsx
└── routes.tsx
```

---

## 3. Directory Responsibilities

### `apis/`

Backend API communication.

Contains:

* API modules
* request functions
* response mapping when required

Do not put React UI logic here.

---

### `assets/`

Static frontend assets.

Examples:

* images
* logos
* local fonts when explicitly required
* static illustrations

---

### `components/ui/`

Generic reusable UI primitives.

Examples:

* Button
* Input
* Dialog
* Dropdown
* Badge
* Tooltip
* Tabs

These components must not contain Nexora-specific business rules.

---

### `components/common/`

Reusable application-level components.

Examples:

* PageHeader
* EmptyState
* LoadingState
* ErrorState
* SearchInput

---

### `components/navigation/`

Navigation components.

Examples:

* Sidebar
* Topbar
* Breadcrumb
* WorkspaceSwitcher

---

### `components/feedback/`

Feedback and interaction components.

Examples:

* ConfirmDialog
* Toast-related UI
* ErrorBoundary UI

---

### `constants/`

Static application constants.

Examples:

* route constants
* query keys
* permission constants
* application configuration constants

---

### `hooks/`

Reusable global hooks.

Only place a hook here when it is genuinely reusable across multiple domains.

Feature-specific hooks should remain close to the feature implementation when practical.

---

### `layouts/`

Route/layout composition.

Examples:

* PublicLayout
* AuthenticatedLayout
* WorkspaceLayout

Layouts should compose pages and shared navigation.

---

### `lib/`

Infrastructure and third-party library configuration.

Examples:

* Axios client
* TanStack Query client
* `cn()` helper
* library initialization

---

### `mocks/`

Development API mocking.

Recommended structure:

```text
mocks/
├── data/
└── handlers/
```

Mocking must not leak into business logic.

---

### `pages/`

Route-level pages.

Pages compose:

* layouts
* feature components
* hooks
* API-driven data

Pages should not become large business-logic containers.

---

### `providers/`

Application-level React providers.

Examples:

* QueryProvider
* Auth/session provider
* other approved providers

Only create a provider when global context is actually required.

---

### `schemas/`

Validation schemas.

Primarily:

* Zod schemas
* form validation
* request validation where useful

---

### `stores/`

Client-side state.

Use Zustand only for:

* UI state
* temporary client state
* local preferences
* navigation-related state

Do not store server data here when TanStack Query is appropriate.

---

### `styles/`

Global styling infrastructure and token integration.

The Design System remains the single source of truth.

---

### `types/`

Shared TypeScript types.

Examples:

* domain types
* API types
* shared enums
* response types

---

### `utils/`

Pure reusable utility functions.

Examples:

* date formatting
* file-size formatting
* string formatting

Utilities should not contain React state or API calls.

---

## 4. Data Flow

Preferred flow:

```text
Page
  ↓
Feature Hook
  ↓
TanStack Query
  ↓
API Module
  ↓
Axios Client
  ↓
Backend
```

During parallel development:

```text
Page
  ↓
Feature Hook
  ↓
TanStack Query
  ↓
API Module
  ↓
Axios Client
  ↓
MSW
  ↓
Mock Response
```

---

## 5. Routing

Routing is centralized in:

```text
src/routes.tsx
```

Raw route strings should not be duplicated throughout the codebase.

---

## 6. Dependency Direction

Preferred dependency direction:

```text
Pages
  ↓
Components / Hooks
  ↓
APIs / Stores / Utilities
  ↓
Libraries
```

Lower-level modules must not depend on page-level components.

Generic UI components must not depend on business-specific modules.

---

## 7. Domain Hierarchy

Nexora's core hierarchy is:

```text
Workspace
  └── Board
      └── List
          └── Card
              └── Task
```

Additional concepts such as:

* priority
* deadline
* dependency
* labels
* comments
* activity
* attachments

are attributes/capabilities of the work-management model, not replacements for the hierarchy.

---

## 8. General PM Scope

Do not architect the application around software-development-only concepts.

GitHub is an optional connector.

The core PM experience must remain usable without GitHub.
