# 01 - Modular Clean Architecture in Hono & Bun

This backend boilerplate follows **Modular Clean Architecture (3-Tier)** principles to guarantee scalability, testability, and strict decoupling of concerns.

---

## 🏛 The 4 Core Layers

```
┌─────────────────────────────────────────────────────────┐
│                      CONTROLLER                         │
│  (Hono Routes, zValidator, Request/Response Parsing)    │
│  • Validates inputs using Zod                           │
│  • Invokes Service layer methods                        │
│  • Returns standardized JSON envelope (sendSuccess)     │
└───────────────────────────▲─────────────────────────────┘
                            │ (DTOs & Domain Objects)
┌───────────────────────────┴─────────────────────────────┐
│                       SERVICE                           │
│  (Business Logic, Domain Rules, Security & Workflows)   │
│  • Manages password hashing (Argon2id) & JWT tokens     │
│  • Token rotation & authorization logic                 │
│  • Never touches raw HTTP Request or Response objects   │
└──────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│        REPOSITORY         │  │          SCHEMA          │
│ (Drizzle ORM Queries)     │  │ (Zod & DTO Types)        │
│ • Database CRUD           │  │ • Request/Response DTOs  │
│ • SQL queries & relations │  │ • Runtime Zod Schemas    │
└───────────────────────────┘  └──────────────────────────┘
```

---

## 1. Controller (`modules/<feature>/<feature>.controller.ts`)
The Controller handles HTTP transport concerns:
- Extracts parameters, query strings, and body payloads.
- Validates requests at runtime using `@hono/zod-validator`.
- Delegates business logic to the Service.
- Formats responses using `@core/utils/response.util` (`sendSuccess`, `sendCreated`).

---

## 2. Service (`modules/<feature>/<feature>.service.ts`)
The Service contains pure business logic:
- Independent of Hono or HTTP transport.
- Enforces domain rules, invariants, and business checks.
- Calls Repositories to persist or fetch data.
- Throws standard `HTTPException` on domain violations (e.g. 409 Conflict, 401 Unauthorized).

---

## 3. Repository (`modules/<feature>/<feature>.repository.ts`)
The Repository manages persistence using **Drizzle ORM**:
- Contains SQL operations (`insert`, `select`, `update`, `delete`).
- Shields the Service from database implementation details.
- Returns clean typed entities.

---

## 4. Schemas & Types (`modules/<feature>/<feature>.schema.ts`)
- Defines Zod validation schemas (`z.object({...})`).
- Exports TypeScript types (`type RegisterInput = z.infer<typeof registerSchema>`).
