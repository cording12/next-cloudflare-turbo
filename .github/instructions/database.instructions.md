---
applyTo: "packages/db/**"
---

# Database Package (@nct/db) Patterns

## Package Purpose
Shared database schema definitions, types, and migration files. Consumed by apps and other packages.

## Package Structure
```
packages/db/
├── src/
│   ├── schema/
│   │   ├── users.sql.ts         # Table schemas
│   │   └── posts.sql.ts
│   ├── types/
│   │   ├── users.types.ts       # Derived types
│   │   └── posts.types.ts
│   ├── utils.ts                 # Common utilities (timestamps, etc.)
│   └── index.ts                 # Main package exports
├── drizzle/
│   └── migrations/              # Generated migration files
├── drizzle.config.ts           # Drizzle configuration
├── drizzle.studio.config.ts    # Studio configuration
└── package.json
```

## Schema Definition Patterns

### Standard Table Schema
```tsx
// biome-ignore lint:performance/noNamespaceImport This is how Drizzle is recommended to be used
import * as t from "drizzle-orm/sqlite-core"
import { sqliteTable as table } from "drizzle-orm/sqlite-core"
import { timestamps } from "../utils"

export const users = table(
  "users",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    firstName: t.text("first_name"),
    lastName: t.text("last_name"),
    email: t.text().notNull().unique(),
    role: t.text().$type<"guest" | "user" | "admin">().default("guest"),
    ...timestamps,
  },
  (tbl) => [t.uniqueIndex("email_idx").on(tbl.email)]
)
```

### Self-Referencing Foreign Keys
```tsx
import {
  type AnySQLiteColumn,
  sqliteTable as table,
} from "drizzle-orm/sqlite-core"

export const users = table("users", {
  id: t.int().primaryKey({ autoIncrement: true }),
  // Self-referencing foreign key (user who invited this user)
  invitee: t.int().references((): AnySQLiteColumn => users.id),
  // ... other fields
})
```

### Common Field Patterns
```tsx
// Primary keys (column name inferred from property)
id: t.int().primaryKey({ autoIncrement: true })

// Primary keys (explicit column name)
id: t.int("id").primaryKey({ autoIncrement: true })

// Required text fields with explicit column names
firstName: t.text("first_name").notNull()

// Optional text fields
content: t.text()

// Enums with TypeScript types
role: t.text().$type<"guest" | "user" | "admin">().default("guest")

// Foreign keys (simple)
userId: t.int("user_id").notNull()

// Foreign keys with references
invitee: t.int().references((): AnySQLiteColumn => users.id)

// Timestamps (use spread from utils)
...timestamps
```

### Timestamp Utilities (utils.ts)
```tsx
import { sql } from "drizzle-orm"
import { text } from "drizzle-orm/sqlite-core"

export const timestamps = {
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text("deleted_at"),
}
```

## Type Export Patterns

### Basic Type Exports (types/[entity].types.ts)
```tsx
import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import type { users } from "../schema/users.sql"

export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>
```

### Enum Constants and Types
```tsx
export const USER_ROLES = ["guest", "user", "admin"] as const
export type UserRole = (typeof USER_ROLES)[number]
```

### Complex Type Patterns (when needed)
```tsx
// For joined/computed types
export type UserWithPosts = SelectUser & {
  posts: SelectPost[]
}

// For API responses
export type UserListItem = Pick<SelectUser, 'id' | 'firstName' | 'lastName' | 'email'>

// For form validation
export type CreateUserData = Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt'>
```

## Package Export Structure

### Main Package Index (src/index.ts)
```tsx
import type { D1Database } from "@cloudflare/workers-types"
import { drizzle } from "drizzle-orm/d1"

// Export all schemas
export * from "./schema/posts.sql"
export * from "./schema/users.sql"

// Export all types
export * from "./types/posts.types"
export * from "./types/users.types"

// Import schemas for consolidated export
import { posts } from "./schema/posts.sql"
import { users } from "./schema/users.sql"

// Consolidated schema object for Drizzle
export const schema = {
  users,
  posts,
} as const

// Connection factory - called in Workers
export function createDrizzleD1(d1: D1Database) {
  return drizzle(d1, { schema })
}

export type Database = ReturnType<typeof createDrizzleD1>
```

## Migration Workflow

### Available Scripts (from package.json)
```bash
# Generate migration files from schema changes
npm run db:generate

# Open Drizzle Studio for local database inspection
npm run db:studio
```

### Schema Changes Process
1. **Modify schema** in `src/schema/[table].sql.ts`
2. **Generate migration** from packages/db directory:
   ```bash
   npm run db:generate
   ```
3. **Review generated migration** in `drizzle/migrations/` directory
4. **Apply migration** from apps/app directory (has wrangler.jsonc):
   ```bash
   npm run db:migrate:local    # Local development
   npm run db:migrate:prod     # Production
   ```

### Example Schema Changes

#### Adding New Column
```tsx
export const users = table(
  "users",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    firstName: t.text("first_name"),
    lastName: t.text("last_name"),
    email: t.text().notNull().unique(),
    phoneNumber: t.text("phone_number"), // NEW COLUMN
    invitee: t.int().references((): AnySQLiteColumn => users.id),
    role: t.text().$type<"guest" | "user" | "admin">().default("guest"),
    ...timestamps,
  },
  (tbl) => [t.uniqueIndex("email_idx").on(tbl.email)]
)
```

#### Creating New Table
```tsx
// packages/db/src/schema/projects.sql.ts
import * as t from "drizzle-orm/sqlite-core"
import { sqliteTable as table } from "drizzle-orm/sqlite-core"
import { timestamps } from "../utils"

export const projects = table("projects", {
  id: t.int("id").primaryKey({ autoIncrement: true }),
  userId: t.int("user_id").notNull(),
  name: t.text().notNull(),
  description: t.text(),
  status: t.text().$type<"active" | "completed" | "archived">().default("active"),
  ...timestamps,
}, (tbl) => [
  t.index("projects_user_id_idx").on(tbl.userId),
])
```

Then export from src/index.ts:
```tsx
export * from "./schema/projects.sql"
export * from "./types/projects.types"

import { projects } from "./schema/projects.sql"

export const schema = {
  users,
  posts,
  projects, // Add new table
} as const
```

## Relationship Patterns

### One-to-Many (Simple Foreign Key)
```tsx
// Parent table (users)
export const users = table("users", {
  id: t.int().primaryKey({ autoIncrement: true }),
  // ... other fields
})

// Child table (posts) 
export const posts = table("posts", {
  id: t.int("id").primaryKey({ autoIncrement: true }),
  userId: t.int("user_id").notNull(), // Simple foreign key
  // ... other fields
})
```

### Self-Referencing Relationships
```tsx
export const users = table("users", {
  id: t.int().primaryKey({ autoIncrement: true }),
  // User who invited this user (self-reference)
  invitee: t.int().references((): AnySQLiteColumn => users.id),
  // ... other fields
})
```

## Configuration Files

### Drizzle Config (drizzle.config.ts)
```tsx
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema",
  out: "./drizzle/migrations",
  driver: "d1-http",
})
```

### Studio Config (drizzle.studio.config.ts)
Uses complex file discovery to find local .sqlite file in Wrangler's state directory for local development inspection.

## Naming Conventions

### Tables
- Use plural nouns: `users`, `posts`
- Use camelCase in code: `users`, `posts`

### Columns
- Use snake_case for database: `first_name`, `user_id`
- Use explicit column names when different from property: `firstName: t.text("first_name")`
- Use implicit column names when they match: `content: t.text()`

### Indexes
- Format: `[table]_[column(s)]_idx`
- Examples: `users_email_idx`, `posts_user_id_idx`

### Types
- Use PascalCase: `SelectUser`, `InsertUser`
- Follow pattern: `Select[Entity]`, `Insert[Entity]`
- Add constants for enums: `USER_ROLES`, `UserRole`

## Import Patterns

### Schema Files
```tsx
// biome-ignore lint:performance/noNamespaceImport This is how Drizzle is recommended to be used
import * as t from "drizzle-orm/sqlite-core"
import { sqliteTable as table } from "drizzle-orm/sqlite-core"

// For self-referencing foreign keys
import { type AnySQLiteColumn } from "drizzle-orm/sqlite-core"

// Utilities
import { timestamps } from "../utils"
```

### Utility Files
```tsx
import { sql } from "drizzle-orm"
import { text } from "drizzle-orm/sqlite-core"
```

## DO
- Use `sqliteTable as table` for consistency
- Include timestamps on all tables using spread (`...timestamps`)
- Use `$type<>` for enums to get TypeScript types
- Add indexes for commonly queried fields
- Use explicit column names when they differ from property names
- Export schemas and types from main index
- Include biome-ignore comment for namespace imports
- Use `sql`CURRENT_TIMESTAMP`` for default timestamps
- Create enum constants alongside types when helpful

## DON'T
- Write raw SQL in schema files
- Skip indexes on commonly queried fields
- Use inconsistent column naming patterns
- Skip timestamps on tables
- Use any types
- Skip type inference with `$type<>` for enums
- Mix column name patterns (be consistent within tables)
- Forget to export new schemas from main index