# 03 - Coding Standards & Naming Conventions

This document outlines variable, function, type, and general coding guidelines for clean and readable code.

---

## 🌐 Language & Localization Conventions

### 1. Strict English for Code Identifiers

All code artifacts must strictly use standard English:

- **Variables, Functions, Classes, Enums, Types, Interfaces**: English only (e.g. `isProductAvailable`, not `apakahProdukTersedia`; `fetchUserList`, not `ambilDaftarUser`).
- **File & Folder Names**: English only (`useProductListViewModel.ts`, `product.model.ts`).
- **Code Comments & Docstrings**: English only.

### 2. Multi-Language UI Strings via i18n Constants

- **Never hardcode raw UI strings or labels** in JSX or components.
- All user-visible copy (button labels, modal titles, error messages, notifications, category names) must reside in `@core/i18n/locales/` (`en.ts` & `id.ts`) and be retrieved with `useTranslation()` / `t()`.

---

## 🔤 Variable & Function Naming

### 1. Variables & Functions: `camelCase`

```typescript
const totalPrice = calculateTotal(items);
const isUserLoggedIn = checkAuthStatus();
```

### 2. Booleans: Always prefix with a questioning verb

Prefix boolean variables with `is`, `has`, `should`, `can`, or `did`:

- ✅ `isLoading`, `isOpen`, `hasPermission`, `shouldRedirect`, `canEdit`, `isSuccess`
- ❌ `loading`, `open`, `permission`, `redirect`, `edit`

### 3. Event Handlers & Callback Props

- **Internal Handlers (in ViewModel/Component)**: Prefix with `handle` + Event / Action:
  ```typescript
  const handleSubmit = (e: React.FormEvent) => { ... };
  const handleDeleteProduct = (productId: string) => { ... };
  const handleInputChange = (value: string) => { ... };
  ```
- **Component Props (Callbacks passed down)**: Prefix with `on` + Event / Action:
  ```typescript
  interface ButtonProps {
    onClick?: () => void;
    onSubmitSuccess?: (data: Product) => void;
    onDelete?: (id: string) => void;
  }
  ```

### 4. Constants & Enums: `UPPER_SNAKE_CASE` or `as const` Objects

```typescript
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_RETRY_COUNT = 3;

export const UserRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  GUEST: "GUEST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
```

---

## 🏷️ TypeScript Types & Interfaces

### 1. Dedicated Type Files & No Inline/Plain Types (Strict Rule)

- **Zero Inline Types**: Never use inline object types for props, function parameters, or state:

  ```typescript
  // ❌ Bad (Inline type)
  function filterItems(filters: { search?: string; category?: string }) { ... }

  // ✅ Good (Dedicated named type from type file)
  import { type ProductFilters } from '../types/product.types';
  function filterItems(filters: ProductFilters) { ... }
  ```

- **Dedicated File per Type Scope**:
  - Feature domain types: `features/<feature>/types/<feature>.types.ts`
  - Feature ViewModel types: `features/<feature>/types/<feature>-viewmodel.types.ts`
  - Feature component props: `features/<feature>/types/<feature>-component.types.ts`
  - Shared component props: `shared/types/<component>.types.ts`
  - Shared store states: `shared/types/<store>.types.ts`

### 2. Types / Interfaces: `PascalCase`

- Prefer `interface` for object shapes and extensible contracts.
- Prefer `type` for unions, intersections, primitives, tuples, and utility types.
- **Do not prefix interfaces with `I`** (avoid `IProduct`, use `Product`).
- **Do not prefix types with `T`** (avoid `TProduct`, use `Product`).

```typescript
// ✅ Good
export interface Product {
  id: string;
  name: string;
}

export type ProductStatus = "active" | "draft" | "archived";
export type CreateProductInput = Omit<Product, "id">;
```

---

## 🧼 Code Quality & Guard Clauses

### 1. Early Return (Guard Clauses)

Avoid deep nesting of `if-else` blocks. Return early when preconditions fail:

```typescript
// ❌ Bad (Deep nesting)
function processOrder(order?: Order) {
  if (order) {
    if (order.status === "pending") {
      if (order.items.length > 0) {
        return finalizeOrder(order);
      }
    }
  }
  return null;
}

// ✅ Good (Guard Clauses)
function processOrder(order?: Order) {
  if (!order) return null;
  if (order.status !== "pending") return null;
  if (order.items.length === 0) return null;

  return finalizeOrder(order);
}
```

### 2. Immutability

Do not mutate function arguments or state directly:

```typescript
// ❌ Bad
const addItem = (list: string[], item: string) => {
  list.push(item);
  return list;
};

// ✅ Good
const addItem = (list: readonly string[], item: string): string[] => {
  return [...list, item];
};
```

---

## 🎯 `data-testid` Standards for E2E Testing

To ensure testing stability across multi-language translations and UI redesigns, all interactive elements, dynamic list cards, form controls, and feedback widgets **MUST include `data-testid`**:

### 1. Naming Pattern: `kebab-case`

- **Pattern**: `[domain]-[element]-<action/id>`
- **Examples**:
  - Global navigation: `data-testid="navbar-links"`, `data-testid="language-switcher"`
  - Filter and search: `data-testid="product-filter-bar"`, `data-testid="product-search-input"`, `data-testid="product-category-electronics"`
  - List items: `data-testid={`product-card-${product.id}`}`, `data-testid={`delete-product-btn-${product.id}`}`
  - Form controls: `data-testid="input-product-name"`, `data-testid="submit-product-btn"`
  - UI containers: `data-testid="toast-container"`, `data-testid="stat-total-items"`

### 2. Playwright E2E Query Convention

Always query elements via `page.getByTestId(...)` in E2E tests:

```typescript
await page.getByTestId("product-search-input").fill("Keyboard");
await page.getByTestId("add-product-btn").click();
```

### 3. Automatic Production Stripping (Vite & Babel)

To prevent DOM bloat, bot scraping, and internal naming leaks, all `data-testid` attributes are **automatically stripped during production build** (`bun run build`) via `babel-plugin-react-remove-properties` in `vite.config.ts`. They remain fully available during local development (`bun dev`) and E2E testing (`bun run test:e2e`).
