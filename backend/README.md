# Enterprise Hono + Bun Backend Boilerplate

A battle-tested, high-performance backend template built with **Bun**, **Hono**, **Drizzle ORM**, and **PostgreSQL**, designed around **Modular Clean Architecture (3-Tier)**.

---

## ✨ Key Features & Stack

- ⚡ **Bun Runtime**: Ultra-fast TypeScript execution and native Web Crypto / Argon2id password hashing.
- 🔥 **Hono Framework**: Modern, lightweight web standards-compliant HTTP framework.
- 🗄️ **Drizzle ORM & PostgreSQL**: High-performance, SQL-first TypeScript ORM with schema migrations.
- 📊 **Structured JSON Logging**: Observability-ready logs with request duration and status tracking.
- 🆔 **Request ID Tracing**: Automatic generation & propagation of `X-Request-Id` UUID across contexts.
- 🔐 **Dual-Token JWT Security**: Short-lived Access Token + Long-lived Refresh Token Rotation.
- 🛡️ **Zod Validation**: Runtime request body, query, and param validation with custom error mapping.
- 🐳 **Docker Compose**: Pre-configured PostgreSQL 16 service with persistent volume & healthchecks.
- ⚡ **Biome**: Sub-millisecond formatting and linting.

---

## 📁 Project Structure

```
backend/
├── .env.example / .env          # Environment configuration
├── biome.json                   # Biome linter/formatter config
├── docker-compose.yml           # PostgreSQL & App containers
├── Dockerfile                   # Bun multi-stage Docker build
├── drizzle.config.ts            # Drizzle Kit migration config
├── package.json
├── tsconfig.json
├── docs/                        # 5 Complete Engineering Guides
│   ├── 01-architecture-clean.md
│   ├── 02-folder-and-naming.md
│   ├── 03-jwt-and-security.md
│   ├── 04-structured-logging.md
│   └── 05-drizzle-and-database.md
└── src/
    ├── core/                    # Singleton Infrastructure
    │   ├── config/env.ts        # Zod validated env variables
    │   ├── database/            # Drizzle client, schema, seeders
    │   ├── logger/logger.ts     # Structured JSON Logger
    │   ├── middlewares/         # Request ID, Logging, Error, CORS, Auth
    │   ├── types/               # AppEnvironment, ApiResponse, DTOs
    │   └── utils/               # Argon2id password util, ApiResponse util
    ├── modules/
    │   └── auth/                # Reference Auth Module (Controller, Service, Repo)
    ├── app.ts                   # Hono App Factory
    └── index.ts                 # Server Entrypoint
```

---

## 🚀 Getting Started with Bun

### 1. Start PostgreSQL with Docker
```bash
docker compose up -d postgres
```

### 2. Install Dependencies & Push Database Schema
```bash
bun install
bun run db:push
bun run db:seed
```

### 3. Start Development Server
```bash
bun dev
```
Server will start listening at `http://localhost:4000`.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server health check & metrics | ❌ |
| `POST` | `/api/v1/auth/register` | Register new user account | ❌ |
| `POST` | `/api/v1/auth/login` | Authenticate with credentials | ❌ |
| `POST` | `/api/v1/auth/refresh` | Rotate & refresh token pair | ❌ |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token | ❌ |
| `GET` | `/api/v1/auth/me` | Get authenticated user profile | ✅ Bearer |

---

## 🧪 Testing & Code Quality

```bash
# Run unit & integration tests
bun test

# Run Biome linter check
bun run lint

# Auto-fix formatting and linting
bun run lint:fix
bun run format
```
