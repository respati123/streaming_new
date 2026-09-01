# 02 - Folder Structure & Naming Conventions

Consistency across folders and files is critical for maintaining an enterprise backend codebase.

---

## 📁 Directory Structure Breakdown

```
src/
├── core/                        # Global Singleton Infrastructure
│   ├── config/                  # Validated environment variables (Zod)
│   ├── database/                # Drizzle ORM instance, schema, and seeder
│   ├── logger/                  # Structured JSON Logger
│   ├── middlewares/             # Request ID, Logging, Error, CORS, Auth
│   ├── types/                   # Hono Context Variables, ApiResponse types
│   └── utils/                   # Password hasher (Argon2id), response envelope
│
├── modules/                     # Vertical Feature Slices
│   └── <feature-name>/          # e.g., auth, users, products, orders
│       ├── <feature>.controller.ts
│       ├── <feature>.service.ts
│       ├── <feature>.repository.ts
│       ├── <feature>.schema.ts
│       └── <feature>.types.ts
│
├── app.ts                       # Hono Application Factory & Global Middlewares
└── index.ts                     # Server Startup Entrypoint
```

---

## 🏷️ Naming Rules & File Casing

| Entity | Casing Rule | Example | Description |
| :--- | :--- | :--- | :--- |
| **Feature Folders** | `kebab-case` | `auth/`, `order-processing/` | Directory names |
| **Controllers** | `[feature].controller.ts` | `auth.controller.ts` | Hono router definitions |
| **Services** | `[feature].service.ts` | `auth.service.ts` | Business logic class/functions |
| **Repositories** | `[feature].repository.ts` | `auth.repository.ts` | Drizzle database operations |
| **Schemas** | `[feature].schema.ts` | `auth.schema.ts` | Zod validation schemas |
| **Types / DTOs** | `[feature].types.ts` | `auth.types.ts` | Domain models and DTO types |
| **Middlewares** | `[name].middleware.ts` | `request-id.middleware.ts` | Hono middlewares |
| **Utilities** | `[name].util.ts` | `password.util.ts` | Helper functions |

---

## 🗺️ Configured Path Aliases

| Alias | Target Path | Usage Example |
| :--- | :--- | :--- |
| `@/*` | `src/*` | `@/app`, `@/index` |
| `@core/*` | `src/core/*` | `@core/config/env`, `@core/logger/logger` |
| `@modules/*` | `src/modules/*` | `@modules/auth/auth.service` |
