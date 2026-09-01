# 01 - MVVM Architecture in React

This boilerplate follows the **Model-View-ViewModel (MVVM)** architectural pattern tailored for React applications.

---

## 🏛 The 4 Core Layers

```
┌─────────────────────────────────────────────────────────┐
│                          VIEW                           │
│  (UI Components, Pages, JSX, Tailwind CSS Styling)       │
│  • Pure & Presentational                                │
│  • Zero direct business logic or API calls              │
│  • Binds to ViewModel properties & triggers callbacks   │
└───────────────────────────▲─────────────────────────────┘
                            │ (State & Action Handlers)
┌───────────────────────────┴─────────────────────────────┐
│                       VIEWMODEL                         │
│  (Custom Hooks: `use<Feature>ViewModel`)                │
│  • UI Business Logic & State Computation                │
│  • Form handling & validation (Zod)                     │
│  • Orchestrates queries, mutations & side effects       │
│  • Manages local UI state (dialogs, tabs, filters)     │
└──────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│          SERVICE          │  │          MODEL           │
│ (Axios / TanStack Query)  │  │ (Types, DTOs, Schemas)   │
│ • HTTP endpoints          │  │ • Domain Interfaces      │
│ • Server State Caching    │  │ • Zod Schemas            │
│ • Error Normalization     │  │ • Data Mappers / DTOs    │
└───────────────────────────┘  └──────────────────────────┘
```

---

## 1. Model (`features/<feature>/models/`)
The **Model** represents domain entities, data transfer objects (DTOs), and validation rules.

- **`*.model.ts`**: TypeScript types and interfaces representing the clean domain entity.
- **`*.schema.ts`**: Zod validation schemas for forms, request payloads, and response contracts.
- **`*.mapper.ts`** *(Optional)*: Functions to transform raw backend DTOs into frontend domain models.

### Example:
```typescript
// models/product.model.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'electronics' | 'clothing' | 'food';
  createdAt: string;
}

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt'>;
```

---

## 2. ViewModel (`features/<feature>/viewmodels/`)
The **ViewModel** is implemented as a **Custom React Hook** (e.g. `useProductListViewModel.ts`).

### Responsibilities:
1. **Fetch & Cache data**: Calls Service / React Query hooks.
2. **Compute UI State**: Filtering, sorting, searching, calculating totals.
3. **Form & Validation handling**: Executes Zod validation before submitting.
4. **Action Handlers**: Defines functions like `handleDelete`, `handleSubmitForm`, `handleSearchChange`.
5. **Toast / Notification feedback**: Triggers UI feedback upon success/error.

### Structure:
```typescript
export function useProductListViewModel() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products, isLoading, error } = useQuery(...);

  // Filtered / Computed data
  const filteredProducts = useMemo(() => {
    return products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
  }, [products, searchTerm]);

  // Handlers
  const handleSearchChange = (query: string) => setSearchTerm(query);
  const handleDeleteProduct = async (id: string) => { /* mutation logic */ };

  return {
    // State exposed to View
    state: {
      products: filteredProducts,
      searchTerm,
      isLoading,
      error,
    },
    // Actions exposed to View
    actions: {
      handleSearchChange,
      handleDeleteProduct,
    },
  };
}
```

---

## 3. View (`features/<feature>/views/` & `components/`)
The **View** contains React components and pages that are strictly responsible for rendering.

### Rules for Views:
- **No Direct API calls**: Views must never import `axios`, `fetch`, or direct React Query hooks.
- **No Complex Calculations**: Any math, regex, formatting, or filtering belongs in the ViewModel or utility helpers.
- **Clean JSX**: Bind directly to ViewModel properties and event handlers.

### Example:
```tsx
// views/ProductListPage.tsx
export function ProductListPage() {
  const { state, actions } = useProductListViewModel();

  if (state.isLoading) return <LoadingSpinner />;
  if (state.error) return <ErrorMessage message={state.error.message} />;

  return (
    <div>
      <SearchInput value={state.searchTerm} onChange={actions.handleSearchChange} />
      <ProductGrid items={state.products} onDelete={actions.handleDeleteProduct} />
    </div>
  );
}
```

---

## 4. Service (`features/<feature>/services/` & `@core/http`)
The **Service** layer handles all external communication.

- Communicates with backend endpoints via the centralized Axios client `@core/http/api-client`.
- Exposes pure asynchronous functions or TanStack Query hooks.
- Normalizes server error responses into standard format.

---

## Benefits of MVVM in React
- 🚀 **Testability**: ViewModels can be tested using `@testing-library/react-hooks` without rendering the DOM.
- 🎨 **Design System Agnostic**: Swap Tailwind/Chakra/Material-UI in the View without touching a single line of business logic.
- 👥 **Team Collaboration**: UI designers / Frontend devs can build Views while logic engineers build ViewModels and Services simultaneously.
