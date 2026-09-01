# AGENTS.md

## Project map
- `src/app/` — Application bootstrap, top-level providers (`AppProviders.tsx`), route definitions (`AppRoutes.tsx`), 404 page (`NotFoundPage.tsx`), types (`app.types.ts`), and root application component (`App.tsx`).
- `src/core/` — Core singleton infrastructure (framework-independent):
  - `core/config/` — Environment variable validation via Zod (`env.ts`).
  - `core/constants/` — App-wide constants and storage keys (`app.constant.ts`).
  - `core/http/` — Centralized Axios instance with auth token injection and error handling (`api-client.ts`).
  - `core/i18n/` — Multi-language internationalization engine (`i18n.ts`, `i18n.types.ts`, `locales/en.ts`, `locales/id.ts`).
  - `core/utils/` — Global utility helpers (`cn.ts`, `formatters.ts`, `formatter.types.ts`).
- `src/shared/` — Reusable domain-agnostic code across multiple features:
  - `shared/components/` — UI primitives (`shared/components/ui/` Button, Input, Modal, Badge, LoadingSpinner, ToastContainer, LanguageSwitcher, EmptyState, ErrorBoundary) and layout (`shared/components/layout/` Navbar, AppLayout).
  - `shared/hooks/` — Generic custom React hooks (`useDebounce.ts`, `useDisclosure.ts`, `useTranslation.ts`).
  - `shared/stores/` — Global client-side Zustand stores (`auth.store.ts`, `ui.store.ts`, `i18n.store.ts`).
  - `shared/types/` — Dedicated type files per component/store/hook (`button.types.ts`, `input.types.ts`, `modal.types.ts`, `badge.types.ts`, `spinner.types.ts`, `empty-state.types.ts`, `error-boundary.types.ts`, `auth.types.ts`, `ui-store.types.ts`, `i18n-store.types.ts`, `disclosure.types.ts`, `layout.types.ts`, `api.types.ts`).
- `src/features/` — Vertical feature domain slices (e.g., `products`, `docs`):
  - `features/<feature>/types/` — Dedicated type files per domain concern (`<feature>.types.ts`, `<feature>-viewmodel.types.ts`, `<feature>-component.types.ts`).
  - `features/<feature>/models/` — Domain entity re-exports (`*.model.ts`), Zod schemas (`*.schema.ts`), and optional mappers (`*.mapper.ts`).
  - `features/<feature>/services/` — HTTP API services & queries/mutations (`*.service.ts`).
  - `features/<feature>/viewmodels/` — Custom React hooks encapsulating UI logic, URL state, and actions (`use<Feature>ViewModel.ts`).
  - `features/<feature>/views/` — Pure presentational page/container components (`<Feature>Page.tsx`).
  - `features/<feature>/components/` — Feature-scoped sub-components (`<Feature>Card.tsx`, `<Feature>FilterBar.tsx`, etc.).
- `e2e/` — End-to-end user journey tests (`*.spec.ts` via Playwright).
- `docs/` — Architecture and coding standards documentation (`01-architecture-mvvm.md` through `07-rendering-and-performance.md`).

## Stack & Toolchain
- **Package Manager / Runtime**: **Bun** (`bun.lockb` / `bun.lock`) — **DO NOT USE NPM**.
- **Linter & Formatter**: **Biome** (`@biomejs/biome` via `biome.json`).
- **Build / Bundler**: Vite 6, React 18, TypeScript 5 (Strict Mode).
- **Styling**: Tailwind CSS 3, PostCSS, Autoprefixer, `clsx`, `tailwind-merge`.
- **Server State**: `@tanstack/react-query` v5, `@tanstack/react-query-devtools`.
- **Global Client State**: `zustand` v5.
- **Routing & URL State**: `react-router-dom` v6 (`useSearchParams`).
- **Internationalization (i18n)**: Type-safe multi-language support (English `en` & Bahasa Indonesia `id`).
- **Schema Validation**: `zod` v3.
- **HTTP Client**: `axios` v1.
- **Unit & Integration Test**: Vitest + `@testing-library/react` + `jsdom`.
- **E2E Test**: Playwright.
- **Icons**: `lucide-react`.

## Commands (Bun Only)
- Install dependencies: `bun install`
- Dev server: `bun dev` (or `bun run dev`)
- Build: `bun run build` (`tsc --noEmit && vite build`)
- Lint & Format Check: `bun run lint` (`biome check src/`)
- Lint & Format Fix: `bun run lint:fix` (`biome check --write src/`)
- Format Code: `bun run format` (`biome format --write src/`)
- Unit & Integration Tests (Tier 1 & 2): `bun run test`
- Watch Tests: `bun run test:watch`
- Test Coverage: `bun run test:coverage`
- E2E Tests (Tier 3 Positive Cases): `bun run test:e2e`
- Preview: `bun run preview` (`vite preview`)

## Conventions & Rules

### 1. Dedicated Type Files & No Inline Types (Strict Rule)
- **Zero Inline or Plain Types**:
  - **NEVER** write inline object types in function parameters, props, generic parameters, or state (e.g. `(filters?: { search?: string })` is strictly forbidden).
  - Every type must be explicitly named, strongly typed, and placed in a **dedicated `.types.ts` file**.
- **Dedicated Type File per Feature & Module**:
  - Domain types: `features/<feature>/types/<feature>.types.ts` (e.g. `product.types.ts`).
  - ViewModel types: `features/<feature>/types/<feature>-viewmodel.types.ts` (e.g. `product-viewmodel.types.ts`).
  - Component props: `features/<feature>/types/<feature>-component.types.ts` (e.g. `product-component.types.ts`).
  - Shared UI props: `shared/types/<component>.types.ts` (e.g. `button.types.ts`, `input.types.ts`, `modal.types.ts`, `badge.types.ts`, `spinner.types.ts`).
  - Store states: `shared/types/<store>.types.ts` (e.g. `auth.types.ts`, `ui-store.types.ts`, `i18n-store.types.ts`).
  - Hook returns: `shared/types/<hook>.types.ts` (e.g. `disclosure.types.ts`).

### 2. Codebase Language & UI Label Conventions
- **Strict English for Code Identifiers**:
  - ALL variable names, function names, class names, type/interface names, file names, directory names, and code comments **MUST be written in standard English**.
  - No mixing of Indonesian words in code identifiers (e.g. use `isProductAvailable`, never `apakahProdukTersedia`; use `fetchUserList`, never `ambilDaftarUser`).
- **Centralized Multi-Language (i18n) for UI Labels**:
  - **NEVER hardcode raw UI strings or labels** directly inside React components or JSX.
  - All user-facing strings, button labels, toasts, placeholders, error messages, and category names must be defined in the i18n locale dictionaries (`src/core/i18n/locales/en.ts` and `src/core/i18n/locales/id.ts`) and accessed via `useTranslation()` / `t('path.to.key')`.

### 3. URL Query Params for All Filters & Search
- **Mandatory URL State**:
  - Any list filtering, searching, sorting, and pagination **MUST be synchronized with URL query params** using `useSearchParams` from `react-router-dom`.
  - Filter state must not be trapped in isolated `useState`.
  - Updating a filter must update the URL search parameters (`setSearchParams(..., { replace: true })`), enabling shareable URLs and browser history support (Back/Forward).
  - Search inputs must use debouncing before writing to URL search params to avoid cluttering browser history.

### 4. 3-Tier Testing Strategy (TDD & Anti-Redundancy)
- **Tier 1 — Unit Tests (`src/**/*.test.ts` via Vitest)**:
  - Scope: Pure functions, Zod validation schemas (`*.schema.ts`), core utils/formatters (`formatters.ts`), i18n translation engine (`i18n.ts`), generic hooks (`useDebounce.ts`, `useDisclosure.ts`).
  - Handles: All edge cases, invalid data combinations, boundary conditions, regex/formatting.
- **Tier 2 — ViewModel Integration Tests (`src/**/*.test.ts` via Vitest + `@testing-library/react`)**:
  - Scope: ViewModels (`use<Feature>ViewModel.ts`) tested with `renderHook`, React Query caching/mutation behavior, URL search params synchronization.
  - Handles: State transitions, data loading/error lifecycles, modal open/close actions, mutation success/error callbacks.
- **Tier 3 — E2E Smoke Tests (`e2e/*.spec.ts` via Playwright)**:
  - Scope: **Positive cases only** (Critical User Journeys / Happy Path: e.g. Catalog view → filter category → search keyword → navigate to detail → open create modal → submit valid product).
  - **Mandatory `data-testid` Rule**: All interactive buttons, inputs, modals, dynamic list items, and feedback containers must specify semantic `data-testid` (`kebab-case`), and Playwright tests must query via `page.getByTestId(...)`.
  - **Automatic Production Stripping**: In production builds (`mode === 'production'`), all `data-testid` attributes are **automatically stripped** via `babel-plugin-react-remove-properties` in `vite.config.ts` to prevent DOM bloat, bot scraping, and internal naming leaks.
  - **Strict No-Redundancy Rule**: NEVER duplicate edge cases, error state permutations, or detailed form validations in E2E tests. Edge cases belong exclusively in Tier 1 & Tier 2 to keep CI/CD fast and zero-flakiness.

### 5. MVVM Architecture & Layer Separation
- **Model** (`features/<feature>/models/` & `types/`):
  - Domain entities and DTOs in `features/<feature>/types/<feature>.types.ts`.
  - Runtime validation schemas in `[domain].schema.ts` using Zod (`z.infer<typeof ...>`).
  - Optional transformation mappers in `[domain].mapper.ts`.
- **ViewModel** (`features/<feature>/viewmodels/`):
  - Custom React hook named `use[Feature]ViewModel.ts`.
  - Exclusively exposes `{ state, actions }` with typed `[Feature]ViewModelReturn`.
  - Manages UI logic, data fetching (React Query), computed data (`useMemo`), URL query params synchronization (`useSearchParams`), Zod form validation, and action handlers (`handle*`).
  - Contains no JSX or DOM rendering.
- **View** (`features/<feature>/views/` & `features/<feature>/components/`):
  - Pure presentational JSX and styling.
  - **NEVER** make direct API calls, Axios calls, or direct React Query hook calls inside Views.
  - **NEVER** perform complex calculations or business logic in Views.
  - Binds directly to ViewModel `state` and triggers `actions`.
- **Service** (`features/<feature>/services/` & `@core/http`):
  - Encapsulates API endpoints into pure async functions or React Query hooks.
  - Interacts with backend via `@core/http/api-client`.
  - Normalizes errors to `ApiError`.

### 6. Folder & File Naming
- **Folders**: `kebab-case` (e.g. `product-detail/`, `auth/`). Never mix casing.
- **Pages & Components**: `PascalCase.tsx` (e.g. `ProductListPage.tsx`, `Button.tsx`, `ProductCard.tsx`).
- **ViewModels**: `use[Feature]ViewModel.ts` (e.g. `useProductListViewModel.ts`).
- **Type Files**: `[domain].types.ts`, `[domain]-viewmodel.types.ts`, `[domain]-component.types.ts`.
- **Generic Hooks**: `use[Name].ts` (e.g. `useDebounce.ts`, `useDisclosure.ts`, `useTranslation.ts`).
- **Domain Models**: `[domain].model.ts` (e.g. `product.model.ts`).
- **Validation Schemas**: `[domain].schema.ts` (e.g. `product.schema.ts`).
- **Services**: `[domain].service.ts` (e.g. `product.service.ts`).
- **Zustand Stores**: `[domain].store.ts` (e.g. `auth.store.ts`, `ui.store.ts`, `i18n.store.ts`).
- **Utilities**: `[domain].util.ts` or `[name].ts` (e.g. `cn.ts`, `formatters.ts`).
- **Constants**: `[domain].constant.ts` (e.g. `app.constant.ts`).
- **Unit/Integration Tests**: `[name].test.ts` or `[name].test.tsx`.
- **E2E Tests**: `e2e/[flow].spec.ts`.

### 7. Coding Standards & TypeScript
- **Variables & Functions**: `camelCase`.
- **Booleans**: Always prefix with a questioning verb: `is`, `has`, `should`, `can`, `did` (e.g. `isLoading`, `isOpen`, `hasPermission`). Never use bare names (`loading`, `open`).
- **Event Handlers & Props**:
  - Internal handlers in ViewModel / Component: `handle` + Action (e.g. `handleSubmit`, `handleDeleteProduct`, `handleSearchChange`).
  - Component callback props: `on` + Action (e.g. `onClick`, `onSubmitSuccess`, `onDelete`).
- **Constants & Enums**: `UPPER_SNAKE_CASE` or `as const` object dictionaries.
- **Types & Interfaces**: `PascalCase` defined in dedicated `.types.ts` files. Do not prefix with `I` (use `Product`, not `IProduct`) or `T` (use `UserRole`, not `TUserRole`).
- **No `any` & No Plain/Inline Types**: Use dedicated types, generics, or `unknown` with type narrowing.
- **Guard Clauses**: Use early returns to keep nesting shallow (maximum 3 levels deep).
- **Immutability**: Never mutate parameters or state directly.
- **Component Size**: Keep components under 150-200 lines; extract sub-components when larger.

### 8. Imports & Path Aliases
- **Configured Aliases**:
  - `@/*` → `src/*`
  - `@app/*` → `src/app/*`
  - `@core/*` → `src/core/*`
  - `@shared/*` → `src/shared/*`
  - `@features/*` → `src/features/*`
  - `@assets/*` → `src/assets/*`
- **No relative chains**: Always use path aliases instead of `../../../` relative paths.
- **Direct Imports & No Barrel `index.ts` Anti-Pattern**:
  - **NEVER** create arbitrary barrel `index.ts` files across feature or component directories.
  - Always use **direct, explicit file imports** (e.g. `import { Button } from '@shared/components/ui/Button'`).
  - *Rationale*: Eliminates runtime circular dependencies, prevents bloated bundle sizes, and ensures instantaneous Vite Hot Module Replacement (HMR).
- **Cross-Feature Boundary & Service Promotion**:
  - Features are isolated vertical domain slices. Feature A **MUST NEVER** import private internals, views, components, or viewmodels from Feature B.
  - If a service, query, or utility is needed by **2 or more features** (e.g. `productService` needed in both `products` and `orders`), **promote that service to `@shared/services/`** (or `@core/`) rather than creating cross-feature dependencies.
- **Import Count & Single Responsibility Principle (SRP)**:
  - If a single component or file exceeds **15-20 imports**, it is an architectural code smell indicating a "God Component".
  - Refactor immediately: extract business logic to the ViewModel and split UI into smaller, focused sub-components.
- **Import Ordering** (5 distinct groups separated by blank lines):
  1. Third-party packages (`react`, `@tanstack/react-query`, `lucide-react`, etc.)
  2. Core infrastructure (`@core/...`)
  3. Shared modules (`@shared/...`)
  4. Feature modules (`@features/...`)
  5. Relative imports & styles (`./...`, `../...`, `*.css`)

### 9. State Management Strategy (4 Categories)
- **Server State**: Handled exclusively via `@tanstack/react-query`. Colocate query key factories (e.g. `productQueryKeys`). Invalidate queries on mutation success. Never store raw API payloads in global client stores.
- **Global Client State**: Handled via `zustand` for app-wide UI/auth/i18n state. Always use atomic selectors (e.g. `useUIStore((state) => state.addToast)`, `useI18nStore((state) => state.language)`) to prevent redundant re-renders.
- **URL State**: Handled via `useSearchParams` for all search queries, active tabs, category filters, sorting, and pagination to ensure link shareability.
- **Local Component State**: Handled via `useState` / `useReducer` inside ViewModels/components. Keep state colocated close to where it is used.

### 10. API Integration & Error Handling
- Centralized Axios client at `@core/http/api-client.ts` with automatic Bearer token injection, active `Accept-Language` locale header (`en` / `id`), and timeout.
- Standard response envelope: `ApiResponse<TData>` (`success`, `message`, `data`, `meta`).
- Standard error envelope: `ApiError` (`message`, `statusCode`, `code`, `errors`).
- Runtime input/output validation using Zod in feature `models/*.schema.ts`.

### 11. Rendering & Performance
- **List Keys**: Always use stable unique IDs (`key={product.id}`). Never use array index (`key={index}`) for dynamic or mutable lists.
- **Memoization**: Use `useMemo` for expensive calculations (e.g. filtering 500+ items) and `useCallback` for callbacks passed to memoized children. Do not blindly memoize trivial primitives.
- **Code Splitting**: Use `React.lazy` and `Suspense` for route-level chunking.

## Development workflow (multi-agent)
Roles: `scout` (read-only recon), `pm` (BRD/PRD/issues), `coder` (implements), `techlead` (static review), `qa` (verifies by execution).

Pipeline per feature (one sub-issue = one PR = one full cycle, sequential, backend first):
1. `pm` — BRD → PRD → parent issue + sub-issues.
2. Per sub-issue: label `in-progress` → `scout` recon (mandatory) → `coder` implements → PR (`Closes #<sub-issue>`, never the parent).
3. `techlead` reviews the diff with fresh context: BLOCKING findings go back to `coder` (max 3 rounds, then stop and report); `LGTM` proceeds.
4. `qa` runs serially after LGTM: verifies every acceptance criterion by execution. FAIL goes back to `coder`; PASS → label `done`.
5. A human merges each PR; the next sub-issue starts after the merge. The parent issue is labeled `done` and closed manually when all sub-issues are done. Agents NEVER merge.

### Quick reference — what to type
- Not sure what to do next, for any reason → `setup-dev-workflow` (safe to re-run any time; reports status and recommends the single next command).
- New feature, no spec yet → `to-spec`.
- Spec approved, no issues yet → `to-tickets`.
- Ready to work a sub-issue → `/ship <issue>` (or run the phases on their own: `to-implement` → `code-review-pr` → `to-qa`).
- Just want to know where everything stands → `/scout`.

## Do not
- **Do not use `npm` or `yarn` or `pnpm` — exclusively use `bun`.**
- **Do not use inline or plain types — all types must be explicitly named and defined in dedicated `.types.ts` files.**
- **Do not write redundant tests — edge cases belong in Tier 1/2, E2E Tier 3 is reserved strictly for positive happy path journeys.**
- **Do not use non-English words for variables, functions, types, files, or folders.**
- **Do not hardcode UI text/labels in JSX — always use i18n dictionaries (`t('...')`).**
- **Do not store filter, search, or pagination state exclusively in local `useState` without URL synchronization (`useSearchParams`).**
- Do not merge PRs — merging is always manual.
- Do not let any agent other than `coder` modify code.
- Do not skip the scout step before implementation.
- Do not write direct API calls or business logic inside View components.
- Do not use `any` type in TypeScript.
- Do not create arbitrary barrel `index.ts` files without specific architectural justification.
- Do not use array indices as React list keys on dynamic lists.
- Do not use long relative `../../` import paths when path aliases exist.
- Do not import private internals across feature boundaries.
