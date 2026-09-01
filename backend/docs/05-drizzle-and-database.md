# 05 - Drizzle ORM & PostgreSQL Setup

This backend uses **Drizzle ORM** for type-safe, performant SQL operations against PostgreSQL.

---

## 🗄️ Database Commands

All database operations are managed with Bun and Drizzle Kit:

```bash
# 1. Start PostgreSQL with Docker Compose
docker compose up -d postgres

# 2. Push schema changes directly to PostgreSQL (Prototype / Dev mode)
bun run db:push

# 3. Generate SQL migration files
bun run db:generate

# 4. Apply generated SQL migrations
bun run db:migrate

# 5. Open Drizzle Studio UI (Visual database browser)
bun run db:studio

# 6. Seed initial demo admin user
bun run db:seed
```

---

## 📐 Schema Definition Example

```typescript
// src/core/database/schema.ts
import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

---

## 🔄 Using Drizzle Queries in Repositories

```typescript
import { eq } from 'drizzle-orm';
import { db } from '@core/database';
import { users } from '@core/database/schema';

// Find one
const user = await db.query.users.findFirst({
  where: eq(users.email, 'user@example.com'),
});

// Insert and return
const [newUser] = await db.insert(users).values(payload).returning();
```
