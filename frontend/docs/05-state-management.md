# 05 - State Management Strategy

In modern React architecture, **state should be categorized by its ownership and lifecycle**, rather than dumped into a single global state tree.

---

## 🧭 The 4 Categories of State

```
┌──────────────────────────────────────────────────────────────┐
│ 1. SERVER STATE (Remote Source of Truth)                     │
│    • Tool: @tanstack/react-query                             │
│    • Examples: Product lists, user profiles, API responses   │
│    • Handles: Caching, background refetch, pagination        │
├──────────────────────────────────────────────────────────────┤
│ 2. GLOBAL CLIENT STATE (App-wide UI / Ephemeral State)       │
│    • Tool: Zustand                                           │
│    • Examples: Auth tokens, theme mode, toast notifications  │
│    • Handles: Fast, selector-based reactive global state     │
├──────────────────────────────────────────────────────────────┤
│ 3. URL STATE (Shareable & Bookmarkable State)                │
│    • Tool: React Router useSearchParams                      │
│    • Examples: Active tab, page number, search filter query  │
│    • Handles: Deep-linking, browser back/forward history     │
├──────────────────────────────────────────────────────────────┤
│ 4. LOCAL COMPONENT / VIEWMODEL STATE (Isolated UI state)     │
│    • Tool: useState, useReducer                              │
│    • Examples: Form inputs, modal open/close, hovered items  │
│    • Handles: Component-level interactions                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. Server State with TanStack Query
TanStack Query is used exclusively for remote data. Never store raw API payloads in Zustand or Redux unless offline synchronization is specifically required.

### Key Rules:
- Colocate query keys:
  ```typescript
  export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
  };
  ```
- Invalidate queries after successful mutations:
  ```typescript
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
  ```

---

## 2. Global Client State with Zustand
Zustand is used for truly global, lightweight client-side state.

### Best Practices:
- Always use **selectors** to prevent unnecessary re-renders:
  ```typescript
  // ✅ Good: Only re-renders when `toasts` changes
  const toasts = useToastStore((state) => state.toasts);
  const addToast = useToastStore((state) => state.addToast);

  // ❌ Bad: Re-renders on any store update
  const { toasts, addToast } = useToastStore();
  ```
- Keep store actions colocated within the store definition.

---

## 3. URL State for Search and Filtering (Mandatory)
All list filtering, searching, sorting, and pagination **must be synchronized with URL query params** so users can share links and use browser back/forward history:

### Best Practices:
- Read active filters directly from `useSearchParams`:
  ```typescript
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  ```
- Use `setSearchParams(newParams, { replace: true })` on filter/sort changes to avoid polluting the browser history stack.
- Debounce search input keystrokes before syncing to URL params.
- Never store filter state exclusively in isolated `useState` without URL reflection.
