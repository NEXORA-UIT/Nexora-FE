# Nexora — Frontend

> **Nexora** is an intelligent, general-purpose project management platform integrated with an AI Agent, developed for a university graduation project.

This repository contains the complete frontend web application built with **React**, **TypeScript**, and **Vite**.

---

## Domain Hierarchy

Nexora is designed for general project management across various domains (not restricted solely to software development). The core organizational hierarchy follows:

```text
Workspace
  └── Board (Project)
      └── List (Workflow stage / column)
          └── Card (Main work unit)
              └── Task (Granular checklist item)
```

- **Workspace:** Top-level organization container containing members and boards.
- **Board:** Represents an individual project.
- **List:** Workflow stages / status columns.
- **Card:** The primary unit of work with attributes (priority, assignees, deadlines, dependencies).
- **Task:** Granular sub-items / checklist items belonging to a Card.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework & Build** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/) |
| **Routing** | [React Router 6](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Autoprefixer](https://github.com/postcss/autoprefixer) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [class-variance-authority](https://cva.style/) |
| **State Management** | **Server State:** [TanStack Query v5](https://tanstack.com/query)<br>**Client/UI State:** [Zustand v5](https://github.com/pmndrs/zustand)<br>**Form State:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)<br>**URL State:** React Router |
| **API Client & Mocking** | [Axios](https://axios-http.com/), [MSW (Mock Service Worker)](https://mswjs.io/) |
| **Testing** | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [Playwright](https://playwright.dev/) |
| **Code Quality** | [ESLint 9](https://eslint.org/) (Flat Config), [Prettier](https://prettier.io/) |

---

## Project Architecture

```text
frontend/
├── agent-docs/                  # Mandatory engineering rules for AI coding agents & team
│   ├── AGENTS.md                # Master agent guidelines & constraints
│   ├── ARCHITECTURE.md          # Architectural layers, data flow & structure
│   ├── DESIGN_SYSTEM.md         # Visual tokens, typography & zero-gradient rule
│   ├── CODING_RULES.md          # Strict TypeScript, component & clean-code rules
│   ├── COMPONENT_RULES.md       # Component layers (UI, Common, Navigation, Feedback)
│   ├── API_CONVENTIONS.md       # REST /api/v1 contract, UUIDs, ISO 8601 UTC & MSW
│   ├── STATE_MANAGEMENT.md      # State boundaries & ownership
│   ├── TESTING.md               # Unit, Integration & E2E testing principles
│   └── TEAM_WORKFLOW.md         # Two-developer team workflow & Git branching rules
│
├── public/                      # Static public assets & MSW mockServiceWorker.js
│
└── src/
    ├── apis/                    # Centralized API modules (/api/v1)
    ├── assets/                  # Static assets, logos, and icons
    ├── components/              # 4 component layers
    │   ├── ui/                  # Generic, headless UI primitives
    │   ├── common/              # Reusable app-level components (PageHeader, States)
    │   ├── navigation/          # Navigation items (Sidebar, Topbar)
    │   └── feedback/            # Feedback UI (Dialogs, ErrorBoundary)
    ├── constants/               # Route paths, Query keys, configuration
    ├── hooks/                   # Shared cross-domain custom hooks
    ├── layouts/                 # Route layout wrappers (Public, Authenticated)
    ├── lib/                     # Axios instance, QueryClient, cn() helper
    ├── mocks/                   # MSW data models & API handlers for parallel dev
    │   ├── data/                # Realistic domain mock data
    │   └── handlers/            # Mock endpoint handlers
    ├── pages/                   # Route-level page components
    ├── providers/               # Context providers (QueryClientProvider, Toaster)
    ├── schemas/                 # Zod validation schemas
    ├── stores/                  # Zustand client/UI stores
    ├── styles/                  # Global styles & design system integration
    ├── types/                   # TypeScript domain & API contract types
    ├── utils/                   # Pure utility functions
    │
    ├── App.tsx                  # App root component
    ├── index.css                # Global CSS baseline & Design System tokens
    ├── main.tsx                 # Application entry point
    └── routes.tsx               # Centralized React Router configuration
```

---

## Design System Principles

- **Font:** Inter (`400`, `500`, `600`, `700`)
- **Primary Brand Color:** `#2563EB` (Primary 500)
- **Zero Gradient Rule:** Gradients are strictly prohibited. The interface emphasizes solid colors, clean surfaces, and subtle borders.
- **4px Spacing Baseline:** All margins, paddings, and sizes adhere to a 4px grid.
- **Feedback & States:** Full support for Skeleton loading, Empty states, Error states, 401 Unauthorized, and 403 Forbidden pages.

---

## Getting Started

### Prerequisites

- **Node.js:** `>= 18.0.0` (Recommended: v20+ or v24+)
- **npm:** `>= 9.0.0`

### Installation

```bash
# Clone the repository
git clone https://github.com/NEXORA-UIT/Nexora-FE.git
cd Nexora-FE

# Install dependencies
npm install
```

### Development

```bash
# Start Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server |
| `npm run build` | Compiles TypeScript and builds the production bundle |
| `npm run preview` | Previews the production build locally |
| `npm run typecheck` | Runs `tsc --noEmit` to verify TypeScript types |
| `npm run lint` | Runs ESLint across all source files |
| `npm run lint:fix` | Runs ESLint and automatically fixes fixable issues |
| `npm run format` | Formats all source files with Prettier |
| `npm run format:check` | Verifies code formatting with Prettier |
| `npm run test` | Executes unit and component tests with Vitest |
| `npm run test:watch` | Runs Vitest in watch mode |
| `npm run test:e2e` | Runs Playwright end-to-end tests |

---

## Team Collaboration

This repository is developed by a two-student team:

- **Developer A:** Phan Gia Đạt - 24520287
- **Developer B:** Nguyễn Gia Bảo - 24520168

Both developers and AI agents **MUST** follow the documentation in `agent-docs/` before implementing any feature or use case.
