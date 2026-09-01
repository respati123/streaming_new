# Enterprise React + Vite Boilerplate (MVVM Architecture)

A battle-tested, scalable, production-ready frontend template built with **React**, **Vite**, **TypeScript**, and **Tailwind CSS**, designed around the **MVVM (Model-View-ViewModel)** architectural pattern.

---

## ✨ Features & Tech Stack

- 🍞 **Bun Runtime & Package Manager**: Lightning fast package management (`bun install`, `bun dev`).
- ⚡ **Vite 6** + **React 18** + **TypeScript 5**
- 🏛 **MVVM Architecture**: Strict separation of concerns (Model, View, ViewModel, Service).
- 🌐 **Type-Safe Multi-Language (i18n)**: English (`en`) & Bahasa Indonesia (`id`) with reactive language switcher.
- 🔗 **URL-Synchronized Filter State**: Search, category filters, and sorting persisted via `useSearchParams`.
- 🔄 **TanStack React Query v5**: Server state caching, optimistic updates, query invalidation.
- 🐻 **Zustand v5**: Fast, lightweight global client state management (Auth, Toast, UI, i18n).
- 🛡 **Zod v3**: Runtime schema validation for forms, environment variables, and API contracts.
- 🌐 **Axios v1**: Configured client with automatic Bearer token injection and error normalization.
- 🧪 **3-Tier Testing Toolchain**: Vitest (Unit & Integration) + Playwright (E2E Positive Journeys).
- 🎨 **Tailwind CSS 3**: Modern styling, custom design tokens, responsive UI primitives.
- 🗺 **React Router v6**: Client-side routing with lazy-loaded route splitting.
- 🗂 **Configured Path Aliases**: `@/*`, `@app/*`, `@core/*`, `@shared/*`, `@features/*`, `@assets/*`.

---

## 📁 Project Structure

```
src/
├── app/                  # Application bootstrap, Providers & Router
│   ├── providers/        # QueryClientProvider, RouterProvider
│   ├── routes/           # AppRoutes, Route definitions
│   └── App.tsx
│
├── core/                 # Singleton framework infrastructure
│   ├── config/           # Type-safe environment validation (Zod)
│   ├── constants/        # App-wide constants & storage keys
│   ├── http/             # Axios instance & interceptors
│   ├── i18n/             # Multi-language translation engine & locale dictionaries
│   └── utils/            # Utilities (cn, formatters, storage)
│
├── shared/               # Reusable primitives across features
│   ├── components/       # UI primitives (Button, Input, Modal, Badge, Toast, LanguageSwitcher)
│   │   ├── layout/       # Navbar, AppLayout
│   │   └── ui/           # Atomic UI components
│   ├── hooks/            # Generic hooks (useDebounce, useDisclosure, useTranslation)
│   ├── stores/           # Zustand stores (uiStore, authStore, i18nStore)
│   └── types/            # Dedicated type files (*.types.ts)
│
├── features/             # Vertical Domain Slices
│   ├── products/         # Showcase Feature (Full MVVM Implementation)
│   │   ├── types/        # Dedicated domain, viewmodel & component type files
│   │   ├── models/       # Product types & Zod validation schemas
│   │   ├── services/     # API service / mock repository
│   │   ├── viewmodels/   # Custom hooks (UI & URL filter business logic)
│   │   ├── views/        # Pure presentational pages
│   │   └── components/   # Feature-scoped sub-components
│   └── docs/             # Interactive Architecture Docs Viewer
│
├── e2e/                  # End-to-End user journey tests (Playwright)
├── index.css             # Tailwind base & animations
└── main.tsx              # App mount entry point
```

---

## 📖 Architecture & Standards Documentation

Full guides are located in [`docs/`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/):
1. [`01-architecture-mvvm.md`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/01-architecture-mvvm.md) - MVVM architecture guide & layer boundaries.
2. [`02-folder-and-file-naming.md`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/02-folder-and-file-naming.md) - Strict naming rules and dedicated type files.
3. [`03-coding-standards-and-naming.md`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/03-coding-standards-and-naming.md) - Variable naming, language rules, type standards.
4. [`04-imports-and-aliases.md`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/04-imports-and-aliases.md) - Path aliases and import ordering rules.
5. [`05-state-management.md`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/05-state-management.md) - Server State vs Client State vs URL State.
6. [`06-api-integration.md`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/06-api-integration.md) - Axios client, interceptors, and error envelopes.
7. [`07-rendering-and-performance.md`](file:///home/respati/Projects/ai-playground/boilerplate/frontend/docs/07-rendering-and-performance.md) - Render optimization, keys, and memoization.

---

## 🧪 Testing Strategy (3-Tier TDD)

- **Tier 1 (Unit Tests)**: `bun run test` (Vitest) — Zod schemas, formatters, i18n engine, generic custom hooks.
- **Tier 2 (Integration Tests)**: `bun run test` (Vitest + Testing Library) — ViewModels (`use<Feature>ViewModel`) & URL search params synchronization.
- **Tier 3 (E2E Tests)**: `bun run test:e2e` (Playwright) — Positive happy-path critical user journeys (Catalog browsing, search/filter, detail view, create product).

---

## 🚀 Running the Project with Bun

```bash
# 1. Install dependencies
bun install

# 2. Run local development server
bun dev

# 3. Build for production & type-check
bun run build

# 4. Lint codebase
bun run lint

# 5. Preview production build
bun run preview
```
