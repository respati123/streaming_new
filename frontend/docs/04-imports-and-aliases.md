# 04 - Imports & Path Aliases

To maintain clean code and prevent brittle relative paths (e.g. `../../../shared/components/Button`), this boilerplate configures standard TypeScript path aliases and strict import ordering.

---

## 🗺️ Configured Path Aliases

| Alias | Target Path | Usage Example |
| :--- | :--- | :--- |
| `@/*` | `src/*` | Root `src` access |
| `@app/*` | `src/app/*` | `@app/providers/AppProviders`, `@app/routes/AppRoutes` |
| `@core/*` | `src/core/*` | `@core/http/api-client`, `@core/config/env` |
| `@shared/*` | `src/shared/*` | `@shared/components/ui/Button`, `@shared/stores/ui.store` |
| `@features/*` | `src/features/*` | `@features/products/viewmodels/useProductListViewModel` |
| `@assets/*` | `src/assets/*` | `@assets/images/logo.svg` |

---

## 🗂️ Import Ordering Convention

All file imports must be organized in distinct groups separated by empty lines:

1. **Group 1: React & Third-Party Core Libraries** (React, React Router, TanStack Query, Zustand, Lucide, clsx)
2. **Group 2: Core Infrastructure & Config** (`@core/...`)
3. **Group 3: Shared Modules** (`@shared/...`)
4. **Group 4: Feature Modules** (`@features/...`)
5. **Group 5: Relative imports & Styles** (`./...`, `../...`, `*.css`)

### 📝 Example:

```typescript
// 1. Third-party packages
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Plus } from 'lucide-react';

// 2. Core infrastructure
import { apiClient } from '@core/http/api-client';
import { formatCurrency } from '@core/utils/formatters';

// 3. Shared modules
import { Button } from '@shared/components/ui/Button';
import { useToastStore } from '@shared/stores/ui.store';

// 4. Feature modules
import { type Product } from '@features/products/models/product.model';
import { productService } from '@features/products/services/product.service';

// 5. Relative components or styles
import { ProductCard } from '../components/ProductCard';
```

---

## 🚫 Barrel Files (`index.ts`) Anti-Pattern & Direct Imports

- **Never create arbitrary barrel `index.ts` files** across feature, component, or store directories.
- Always use **direct, explicit file imports** (e.g. `import { Button } from '@shared/components/ui/Button'`).
- **Why?**:
  1. **Prevents Circular Dependencies**: The #1 cause of runtime `undefined` errors in TypeScript.
  2. **Faster Vite HMR**: Changes to a single component only reload that component, instead of triggering full reloads across all barrel consumers.
  3. **Guaranteed Tree-Shaking**: Bundler only bundles the exact module requested without accidental unused code inclusion.

---

## 🔒 Cross-Feature Import Boundaries & Service Promotion

- **Features are isolated vertical domain slices**:
  - `features/orders/` **MUST NEVER** import internal private files, viewmodels, or components from `features/products/`.
- **Shared Service Promotion Rule**:
  - If a service, query, or utility (e.g., `productService`) is consumed by **2 or more features** (e.g. `products`, `orders`, and `cart`):
  - **Promote that service to `@shared/services/`** (or `@core/`) rather than creating coupled cross-feature dependencies.

---

## ⚖️ Import Count & Single Responsibility Principle (SRP)

- **Technical Impact**: Modern bundlers (Vite/Rollup) handle 15-20 imports with 0 runtime penalty.
- **Architectural Threshold**: If a single component or file exceeds **15-20 imports**, it is an architectural code smell indicating a **"God Component"** doing too much.
- **Action**: Split the component into smaller sub-components and delegate business logic to the ViewModel.
