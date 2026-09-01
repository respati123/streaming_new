# 02 - Folder Structure & File Naming Conventions

Consistency across files and folders is vital for project maintainability. Follow these strict conventions:

---

## 📁 Directory Structure Breakdown

```
src/
├── app/                     # App initialization & root setup
│   ├── providers/           # Context providers (QueryClient, Router, etc.)
│   ├── routes/              # Route definitions, Route guards
│   └── App.tsx              # Root component
│
├── core/                    # Core singleton infrastructure (Framework independent)
│   ├── config/              # App environment variables & constants (Zod validated)
│   ├── http/                # Axios instance, Interceptors, Base API Client
│   ├── i18n/                # Multi-language translation engine & locale dictionaries
│   └── utils/               # Generic global utility functions (string, date, formatters)
│
├── shared/                  # Shared reusable code across multiple features
│   ├── components/          # Reusable UI primitives (Button, Input, Modal, Badge, etc.)
│   ├── hooks/               # Generic custom hooks (useDebounce, useDisclosure, etc.)
│   ├── stores/              # Global client state (Zustand: authStore, uiStore, i18nStore)
│   └── types/               # Dedicated TypeScript type files (button.types.ts, api.types.ts)
│
├── features/                # Vertical Feature Slices (Domain modules)
│   └── <feature-name>/      # e.g., auth, products, users, orders
│       ├── types/           # Dedicated feature type files (*.types.ts, *-viewmodel.types.ts)
│       ├── models/          # Domain entities, DTOs, Zod validation schemas
│       ├── services/        # API calls, repository queries & mutations
│       ├── viewmodels/      # Custom React hooks (UI & business logic)
│       ├── views/           # Page and container components (Pure UI)
│       └── components/      # Feature-specific sub-components
│
├── assets/                  # Static assets (images, icons, fonts)
├── index.css                # Global Tailwind CSS imports & base styles
└── main.tsx                 # Vite DOM mounting entrypoint
```

---

## 🏷️ Casing & File Naming Rules

| Entity / Layer | Naming Convention | Example | Description |
| :--- | :--- | :--- | :--- |
| **Folders / Directories** | `kebab-case` | `product-detail/`, `auth/` | Lowercase with dashes for directories |
| **View / Page Components** | `PascalCase.tsx` | `ProductListPage.tsx`, `UserView.tsx` | Components that represent screens or pages |
| **UI Primitive Components** | `PascalCase.tsx` | `Button.tsx`, `Modal.tsx`, `InputField.tsx` | Reusable UI components |
| **Feature Sub-Components** | `PascalCase.tsx` | `ProductCard.tsx`, `ProductFilterBar.tsx` | Feature-scoped UI parts |
| **ViewModels (Hooks)** | `use[Feature]ViewModel.ts` | `useProductListViewModel.ts` | Custom hook binding logic to views |
| **Dedicated Type Files** | `[domain].types.ts` | `product.types.ts`, `button.types.ts` | Explicit, isolated TypeScript type files |
| **ViewModel Type Files** | `[feature]-viewmodel.types.ts` | `product-viewmodel.types.ts` | Typed ViewModel state and action contracts |
| **Component Props Types** | `[feature]-component.types.ts` | `product-component.types.ts` | Typed component prop interfaces |
| **Generic Hooks** | `use[Name].ts` | `useDebounce.ts`, `useDisclosure.ts` | Reusable React hooks |
| **Domain Models & DTOs** | `[domain].model.ts` | `product.model.ts`, `user.model.ts` | TypeScript domain entity re-exports |
| **Validation Schemas** | `[domain].schema.ts` | `product.schema.ts`, `auth.schema.ts` | Zod validation rules |
| **Service / API Handlers** | `[domain].service.ts` | `product.service.ts`, `auth.service.ts` | HTTP communication & queries |
| **Zustand Stores** | `[domain].store.ts` | `auth.store.ts`, `ui.store.ts` | Global client-side state stores |
| **Utilities & Helpers** | `[domain].util.ts` / `.ts` | `formatters.ts`, `storage.util.ts` | Helper functions |
| **Constants** | `[domain].constant.ts` | `app.constant.ts`, `routes.constant.ts` | Fixed configuration values |

---

## 🚫 Anti-Patterns to Avoid
- ❌ **Do not write inline or plain types** in component props or function signatures. Always define types in dedicated `.types.ts` files.
- ❌ **Do not create generic `index.ts` files everywhere** without clear reason. Barrel exports can cause circular dependencies and bloated bundle trees.
- ❌ **Do not place feature-specific components inside `shared/components`**. Only put truly global, domain-agnostic UI widgets in `shared/`.
- ❌ **Do not mix uppercase and lowercase folder names** (e.g. `ProductList/` or `Product_Detail/`). Always use `kebab-case` or lowercase.
