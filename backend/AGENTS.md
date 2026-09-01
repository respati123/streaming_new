# AGENTS.md

## Project map
- `src/core/` — Core singleton infrastructure & cross-cutting concerns:
  - `core/config/` — Environment variable validation via Zod (`env.ts`).
  - `core/constants/` — App constants and standardized error codes (`error-codes.constant.ts`).
  - `core/database/` — Drizzle ORM PostgreSQL connection pool (`index.ts`), table schemas (`schema.ts`), and seed script (`seed.ts`).
  - `core/logger/` — Structured JSON logger with log levels and timestamping (`logger.ts`).
  - `core/middlewares/` — Global and route middlewares (`auth.middleware.ts`, `cors.middleware.ts`, `error.middleware.ts`, `logger.middleware.ts`, `rate-limit.middleware.ts`, `request-id.middleware.ts`, `roles.middleware.ts`, `validate.middleware.ts`).
  - `core/types/` — Shared API envelopes and context types (`api.types.ts`, `context.types.ts`).
  - `core/utils/` — Utility helpers for password hashing (`password.util.ts`), pagination (`pagination.util.ts`), and response serialization (`response.util.ts`).
- `src/modules/` — Vertical domain feature slices (e.g., `auth`, `products`):
  - `modules/<module>/<module>.controller.ts` — Hono route definitions, request validation, and response formatting.
  - `modules/<module>/<module>.service.ts` — Pure business logic, token issuance, password hashing, and domain validation.
  - `modules/<module>/<module>.repository.ts` — Data access layer encapsulating Drizzle ORM queries and transactions.
  - `modules/<module>/<module>.schema.ts` — Runtime request validation schemas via Zod (`zValidator`).
  - `modules/<module>/<module>.types.ts` — Strongly-typed DTOs, entity models, and parameter contracts.
- `src/app.ts` — Top-level Hono application bootstrap, global middleware pipeline, Scalar OpenAPI reference (`/docs`), deep health check (`/health`), and route registration.
- `src/index.ts` — Server entry point using `Bun.serve` and graceful shutdown handlers (`SIGINT`/`SIGTERM`).
- `docs/` — Architecture documentation (`01-architecture-clean.md` through `05-drizzle-and-database.md`).

## Stack & Toolchain
- **Runtime & Package Manager**: **Bun** (`bun.lock` / `bun.lockb`) — **DO NOT USE NPM, YARN, OR PNPM**.
- **Web Framework**: **Hono** v4 (`hono`, `@hono/zod-validator`, `hono/secure-headers`).
- **Database & ORM**: **PostgreSQL** 16 via `postgres` (Postgres.js) + **Drizzle ORM** (`drizzle-orm`, `drizzle-kit`).
- **Linter & Formatter**: **Biome** (`@biomejs/biome` via `biome.json`).
- **Schema Validation**: **Zod** v3.
- **Authentication & Cryptography**: **Argon2id** (`Bun.password`) + **Jose** v5 (JWT Access + Refresh tokens).
- **API Documentation**: **Scalar** (`@scalar/hono-api-reference`).
- **Testing**: **Bun Test** (`bun test`).

## Commands (Bun Only)
- Install dependencies: `bun install`
- Start development server: `bun run dev` (`bun --watch src/index.ts`)
- Start production server: `bun run start` (`bun src/index.ts`)
- Type check: `bun run build` (`tsc --noEmit`)
- Lint & Format Check: `bun run lint` (`biome check src/`)
- Lint & Format Fix: `bun run lint:fix` (`biome check --write src/`)
- Format Code: `bun run format` (`biome format --write src/`)
- Run Test Suite: `bun test`
- Database Push Schema: `bun run db:push` (`drizzle-kit push`)
- Database Run Migrations: `bun run db:migrate` (`drizzle-kit migrate`)
- Database Drizzle Studio GUI: `bun run db:studio` (`drizzle-kit studio`)
- Seed Database: `bun run db:seed` (`bun src/core/database/seed.ts`)

## Conventions & Rules

### 1. Dedicated Type Files & No Inline Types (Strict Rule)
- **Zero Inline Types**:
  - **NEVER** write inline object types in function parameters, repository queries, controller handlers, or service returns (e.g. `async function findUser(query: { email?: string })` is strictly forbidden).
  - Every type must be explicitly named, strongly typed, and placed in a dedicated `.types.ts` file (`modules/<module>/<module>.types.ts` or `core/types/*.types.ts`).

### 2. Codebase Language & Identifiers (Strict English)
- **Strict English Only**:
  - ALL variable names, function names, class names, type/interface names, database column names, error messages, and code comments **MUST be written in standard English**.
  - No mixing of Indonesian words in code identifiers or API responses.

### 3. Centralized Backend Error Codes, Multi-Language Messages, & Response Envelopes
- **All Error Messages and Codes Originate From the Backend**:
  - The frontend must never invent or hardcode backend business error logic. The backend is the single source of truth for all machine-readable error codes (`code`) and user-facing error messages (`message`).
- **Multi-Language Error Localization (`i18nMiddleware`)**:
  - The backend automatically detects the client's language preference from the `Accept-Language` header (e.g. `id-ID,id;q=0.9` or `en-US,en;q=0.9`), custom `x-lang` header, or `?lang=` query parameter.
  - Defaults to English (`en`) if no header is present or for unsupported locales.
  - Translates system and validation error messages via `@core/i18n/` dictionaries (`locales/en.ts` and `locales/id.ts`).
  - Sets the `Content-Language: en` or `Content-Language: id` header on every response.
  - Supports full IDE autocompletion for message keys using `MessageKey` union (`TranslationKey | (string & {})`) or the structured `MessageKeys` constant (`MessageKeys.SUCCESS.*`, `MessageKeys.ERRORS.*`).
- **Standard Machine-Readable Error Codes (`ErrorCode` in `@core/constants/error-codes.constant`)**:
  - `VALIDATION_ERROR` — Zod schema validation failures.
  - `UNAUTHORIZED` / `INVALID_CREDENTIALS` / `TOKEN_EXPIRED` / `TOKEN_INVALID` — Authentication failures.
  - `FORBIDDEN` — Role-based authorization failures.
  - `NOT_FOUND` / `USER_NOT_FOUND` / `PRODUCT_NOT_FOUND` — Resource not found.
  - `DUPLICATE_EMAIL` / `BAD_REQUEST` — Invalid request or state conflict.
  - `RATE_LIMIT_EXCEEDED` — Rate limit exceeded (429).
  - `INTERNAL_SERVER_ERROR` / `DATABASE_ERROR` — Server exceptions.
- **Standard API Response Envelopes**:
  - Success Envelope (`sendSuccess` / `sendCreated`):
    ```json
    {
      "success": true,
      "message": "Resource created successfully",
      "data": { ... },
      "meta": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 },
      "requestId": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```
  - Error Envelope (`errorHandler`):
    ```json
    {
      "success": false,
      "message": "Validation Failed",
      "statusCode": 400,
      "code": "VALIDATION_ERROR",
      "errors": [
        { "field": "email", "message": "Invalid email address format" }
      ],
      "requestId": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```

### 4. 3-Layer Clean Architecture & Separation of Concerns
- **Controller Layer (`modules/<module>/<module>.controller.ts`)**:
  - Defines Hono routes and endpoint paths.
  - Attaches middlewares (`authMiddleware`, `requireRoles`, `validate`).
  - Extracts and validates request inputs (`c.req.valid('json')` / `c.req.valid('query')`).
  - Delegates execution to the Service layer.
  - Returns serialized JSON response using `sendSuccess` or `sendCreated`.
  - **NEVER** write raw Drizzle queries, SQL statements, or database logic in Controllers.
- **Service Layer (`modules/<module>/<module>.service.ts`)**:
  - Encapsulates domain logic, password verification/hashing (Argon2id), JWT token rotation, and pagination math.
  - Throws typed HTTP exceptions (`HTTPException` from `hono/http-exception`).
  - **NEVER** receive or manipulate Hono `Context` (`c`) inside Service methods.
- **Repository Layer (`modules/<module>/<module>.repository.ts`)**:
  - Encapsulates all Drizzle ORM database queries, transactions, joins, and filters.
  - Receives and returns typed entities and parameters defined in `<module>.types.ts`.
  - Isolates the rest of the application from database driver details.

### 5. Production Security & Distributed Tracing
- **Request Tracing**: Every request is assigned a unique `X-Request-Id` UUID via `requestIdMiddleware` which is included in response headers and structured logs.
- **Password Security**: Uses Argon2id via `Bun.password.hash(password, { algorithm: 'argon2id' })`.
- **JWT Dual-Token Rotation**: Access tokens expire in 15 minutes; refresh tokens (7 days) are stored as hashes in the `refresh_tokens` table and rotated on every `/refresh` call.
- **Rate Limiting**: Global rate limit of 120 req/min, with strict auth rate limiting of 25 req/min on `/api/v1/auth/*` to prevent brute-force attacks.
- **Production Information Leak Prevention**: In production (`NODE_ENV === 'production'`), error stack traces and internal database error details are hidden from API error responses.

### 6. Testing Conventions (Bun Test)
- **Unit & Schema Tests**: Validate Zod schemas (`*.schema.test.ts`), pure utility functions (`password.util.test.ts`, `pagination.util.test.ts`), and services with mocked repositories (`*.service.test.ts`).
- **Middleware Tests**: Test RBAC permissions (`roles.middleware.test.ts`), rate limiting (`rate-limit.middleware.test.ts`), and request ID generation (`request-id.middleware.test.ts`).
- **HTTP Endpoint Integration Tests**: Test top-level router and endpoint behavior (`src/app.test.ts`) using Hono's lightweight `app.request(...)` method.

### 7. Folder & File Naming
- **Folders**: `kebab-case` (e.g. `core/middlewares/`, `modules/products/`).
- **Controllers**: `<module>.controller.ts`
- **Services**: `<module>.service.ts`
- **Repositories**: `<module>.repository.ts`
- **Schemas**: `<module>.schema.ts`
- **Types**: `<module>.types.ts`
- **Tests**: `*.test.ts`

### 8. Imports & Path Aliases
- Configured Aliases:
  - `@core/*` → `src/core/*`
  - `@modules/*` → `src/modules/*`
- **No Barrel `index.ts` Anti-Pattern**: Use direct, explicit file imports to avoid circular dependency bugs and preserve fast HMR.
- **Import Ordering** (4 distinct groups separated by blank lines):
  1. Third-party libraries (`hono`, `drizzle-orm`, `zod`, `jose`)
  2. Core infrastructure (`@core/...`)
  3. Feature modules (`@modules/...`)
  4. Relative imports (`./...`, `../...`)

## Development workflow (multi-agent)
Roles: `scout` (read-only recon), `pm` (BRD/PRD/issues), `coder` (implements), `techlead` (static review), `qa` (verifies by execution).

Pipeline per feature (one sub-issue = one PR = one full cycle, sequential, backend first):
1. `pm` — BRD → PRD → parent issue + sub-issues.
2. Per sub-issue: label `in-progress` → `scout` recon (mandatory) → `coder` implements → PR (`Closes #<sub-issue>`, never the parent).
3. `techlead` reviews the diff with fresh context: BLOCKING findings go back to `coder` (max 3 rounds, then stop and report); `LGTM` proceeds.
4. `qa` runs serially after LGTM: verifies every acceptance criterion by execution. FAIL goes back to `coder`; PASS → label `done`.
5. A human merges each PR; the next sub-issue starts after the merge. The parent issue is labeled `done` and closed manually when all sub-issues are done. Agents NEVER merge.

## Do not
- **Do not use `npm`, `yarn`, or `pnpm` — exclusively use `bun`.**
- **Do not use inline or plain types — all types must be explicitly named and defined in dedicated `.types.ts` files.**
- **Do not use non-English words for variables, functions, types, files, folders, or database columns.**
- **Do not hardcode business error messages or error codes on the frontend — the backend is the single source of truth for error codes and messages.**
- **Do not execute raw Drizzle queries or SQL statements inside Controllers — always delegate to the Repository layer.**
- **Do not pass Hono `Context` (`c`) into the Service layer.**
- **Do not store plaintext passwords — always hash with Argon2id.**
- **Do not leak stack traces or raw database errors in production responses.**
- **Do not create arbitrary barrel `index.ts` files without specific architectural justification.**
