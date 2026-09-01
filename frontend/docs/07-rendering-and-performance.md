# 07 - Rendering Patterns & Performance

Optimal React performance stems from sensible component architecture, keeping state close to where it's needed, and avoiding unnecessary work.

---

## ⚡ 1. State Colocation
Do not lift state higher than necessary. If only a single modal or dropdown needs to know if it's open, keep the `isOpen` state in that component or sub-ViewModel.

---

## 🔑 2. Keys in Lists
- **Always use unique, stable IDs** (e.g. `product.id`).
- ❌ **Never use array indices as keys** (`key={index}`) if list items can be reordered, deleted, inserted, or filtered. Doing so causes React reconciliation bugs and input state corruption.

```tsx
// ✅ Good
{products.map((product) => (
  <ProductCard key={product.id} product={product} />
))}
```

---

## 🧠 3. Memoization Guidelines (`useMemo`, `useCallback`, `React.memo`)

- **When to use `useMemo`**:
  - Expensive computations (e.g. heavy filtering/sorting of 500+ items).
  - Preserving stable object references passed to deeply nested memoized children.
- **When to use `useCallback`**:
  - Passing callbacks to children wrapped in `React.memo`.
  - Passing functions into dependency arrays of other hooks (`useEffect`, `useMemo`).
- ❌ **Do not blindly memoize trivial primitives**:
  `const sum = useMemo(() => a + b, [a, b]);` adds more overhead than it saves.

---

## 📦 4. Code Splitting & Lazy Loading
Split routes lazily using `React.lazy` and `Suspense`:

```tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';

const ProductListPage = lazy(() => import('@features/products/views/ProductListPage'));
const ProductDetailPage = lazy(() => import('@features/products/views/ProductDetailPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 🎯 5. Component Splitting & Purity
- Keep components under **150-200 lines**. If a component exceeds this, split it into sub-components (`components/`).
- Keep JSX pure and free of side effects. Side effects belong in `useEffect` or event handlers inside ViewModels.
