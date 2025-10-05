---
applyTo: "apps/app/src/data/**"
---

# Data Access Layer Patterns

## Purpose
Centralised data access layer separating read operations (queries) from write operations (actions). Provides clean abstractions over database operations for the application layer.

## Directory Structure per Entity
```
src/data/[entity]/
├── queries/
│   ├── get-[entity]s.ts           # List operations
│   ├── get-[entity]-by-id.ts      # Single entity lookups
│   └── get-[entity]s-by-[field].ts # Filter operations
├── actions/
│   ├── create.ts                  # Insert operations
│   ├── update.ts                  # Update operations
│   └── delete.ts                  # Delete operations
├── types.ts                       # Derived types
└── index.ts                       # Clean re-exports
```

## Connection Factory Usage

### Understanding getDb vs getDbAsync
- **`getDb()`**: For live user requests (Server Components, Server Actions) - Cloudflare context available synchronously
- **`getDbAsync()`**: For build-time operations (static generation, ISR) - context must be accessed asynchronously

### Queries (Read Operations)

#### Build-time + Request-time Compatible (ISR/SSG)
```tsx
"use server" // Required for build-time execution

import { cache } from "react"
import { getDbAsync } from "@/lib/db"

export const getUsers = cache(async (): Promise<SelectUser[]> => {
  const db = await getDbAsync() // Build-time + request-time compatible
  return await db.select().from(users)
})
```

#### Request-time Only (Live User Requests)
```tsx
// No "use server" - runs only during live requests

import { cache } from "react"
import { getDb } from "@/lib/db"

export const getUserById = cache(async (id: number): Promise<SelectUser | null> => {
  const db = await getDb() // Live request context only
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0] || null
})
```

### Actions (Write Operations)
```tsx
"use server" // Always required for actions

import { getDb } from "@/lib/db" // Actions happen during live requests

export async function createUser(data: Omit<SelectUser, "id">): Promise<SelectUser> {
  const db = await getDb() // Live request context
  const result = await db.insert(users).values(data).returning()
  
  if (!result[0]) {
    throw new Error("Failed to create user")
  }
  
  return result[0]
}
```

## Function Patterns

### Query Functions
- ALWAYS wrap with `cache()` from React
- **Build-time compatible**: Use `"use server"` + `getDbAsync()` for ISR/SSG
- **Request-time only**: No `"use server"` + `getDb()` for live requests only
- Return data directly (arrays, single entities, or null)

### Action Functions  
- ALWAYS use `"use server"` directive (actions are server-side operations)
- ALWAYS use `getDb()` (actions happen during live user requests)
- Return data directly OR throw errors (not structured result objects)
- Common return patterns:
  - `Promise<Entity>` - throw on error
  - `Promise<Entity | null>` - return null on not found  
  - `Promise<boolean>` - success/failure flag
  - `Promise<void>` - fire and forget

## Import Patterns
```tsx
// Database schema & types from @nct/db
import { users, type SelectUser, type InsertUser } from "@nct/db"

// Drizzle operators
import { eq, desc, and, isNull, like } from "drizzle-orm"

// Connection factories
import { getDb, getDbAsync } from "@/lib/db"

// Next.js utilities (when used)
import { revalidatePath } from "next/cache"
```

## "use server" Usage Patterns

### Queries for Build-time + Request-time (ISR/SSG Compatible)
```tsx
"use server" // Enables build-time execution

import { cache } from "react"
import { getDbAsync } from "@/lib/db"

export const getUsers = cache(async (): Promise<SelectUser[]> => {
  const db = await getDbAsync() // Async context for build-time
  return await db.select().from(users)
})
```

### Queries for Request-time Only (Live User Context)
```tsx
// No "use server" - runs only when user makes request

import { cache } from "react"
import { getDb } from "@/lib/db"

export const getUserById = cache(async (id: number): Promise<SelectUser | null> => {
  const db = await getDb() // Synchronous context from live request
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0] || null
})
```

### Actions (Always "use server" + getDb)
```tsx
"use server" // Required for all actions

import { getDb } from "@/lib/db"

export async function createUser(data: Omit<SelectUser, "id">): Promise<SelectUser> {
  const db = await getDb() // Actions always happen during live requests
  // ... implementation
}
```

## Common Query Patterns

### Basic List Query
```tsx
export const getPosts = cache(async (): Promise<SelectPost[]> => {
  const db = await getDbAsync()
  return await db.select().from(posts).orderBy(desc(posts.createdAt))
})
```

### Single Entity Query
```tsx
export const getPostById = cache(async (id: number): Promise<SelectPost | null> => {
  const db = await getDbAsync()
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  return result[0] || null
})
```

### Filtered Query
```tsx
export const getPostsByUserId = cache(async (userId: number): Promise<SelectPost[]> => {
  const db = await getDbAsync()
  return await db
    .select()
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt))
})
```

### Joined Query
```tsx
export const getPostsWithUsers = cache(async (): Promise<PostWithUser[]> => {
  const db = await getDbAsync()

  return await db
    .select({
      // Post fields
      id: posts.id,
      userId: posts.userId,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      deletedAt: posts.deletedAt,
      // User fields
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(isNull(posts.deletedAt))
    .orderBy(desc(posts.createdAt))
})
```

## Common Action Patterns

### Create (Throw on Error)
```tsx
export async function createUser(data: Omit<SelectUser, "id">): Promise<SelectUser> {
  const db = await getDb()
  const result = await db.insert(users).values(data).returning()
  
  if (!result[0]) {
    throw new Error("Failed to create user")
  }
  
  return result[0]
}
```

### Create (With Manual Timestamps)
```tsx
export async function createPost(
  data: Omit<InsertPost, "id" | "createdAt" | "updatedAt" | "deletedAt">
): Promise<SelectPost> {
  const db = await getDbAsync()

  const result = await db
    .insert(posts)
    .values({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  if (!result[0]) {
    throw new Error("Failed to create post")
  }

  return result[0]
}
```

### Update (Return Entity or Null)
```tsx
export async function updateUser(
  id: number,
  data: Partial<Omit<SelectUser, "id">>
): Promise<SelectUser | null> {
  const db = await getDb()

  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()

  return result[0] || null
}
```

### Update (With Manual Timestamps)
```tsx
export async function updatePost(
  id: number,
  data: Partial<Pick<SelectPost, "title" | "content">>
): Promise<SelectPost | null> {
  const db = await getDbAsync()

  const result = await db
    .update(posts)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, id))
    .returning()

  return result[0] || null
}
```

### Delete (Simple)
```tsx
export async function deleteUser(id: number): Promise<void> {
  const db = await getDb()
  await db.delete(users).where(eq(users.id, id))
}
```

### Delete (Soft Delete with Boolean Return)
```tsx
export async function deletePost(id: number): Promise<boolean> {
  const db = await getDbAsync()

  // Get post first for revalidation context
  const existingPost = await db
    .select({ userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (!existingPost[0]) {
    return false
  }

  // Soft delete by setting deletedAt
  const result = await db
    .update(posts)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, id))
    .returning()

  return !!result[0]
}
```

## Revalidation Patterns

Most actions in the codebase don't include revalidation calls, but when needed:

```tsx
export async function updateUserRevalidate(
  id: number,
  data: Partial<Omit<SelectUser, "id">>
): Promise<SelectUser | null> {
  const db = await getDb()

  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()

  // Revalidate cached data
  revalidatePath("/users")
  revalidatePath(`/users/${id}`)

  return result[0] || null
}
```

## Export Patterns

### Entity Index (index.ts)
```tsx
export * from "./actions"
export * from "./queries"
export * from "./types"
```

### Query Index (queries/index.ts)
```tsx
export { getUserById } from "./get-user-by-id"
export { getUsers } from "./get-users"
```

### Action Index (actions/index.ts)
```tsx
export { createUser } from "./create"
export { deleteUser } from "./delete" 
export { updateUser } from "./update"
```

## Type Patterns

```tsx
import type { SelectUser, InsertUser } from "@nct/db"

// Input types for actions
export type CreateUserInput = Omit<SelectUser, "id">
export type UpdateUserInput = Partial<Omit<SelectUser, "id">>

// Joined types for queries
export type PostWithUser = SelectPost & {
  user: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
  }
}
```

## DO
- Separate queries from actions in different directories
- Wrap queries with `cache()`
- Use "use server" + `getDbAsync()` for build-time compatible queries (ISR/SSG)
- Use `getDb()` for request-time only queries (live user context)
- Always use "use server" + `getDb()` for actions (live requests only)
- Import types from @nct/db
- Return data directly or throw errors
- Use explicit return types
- Handle entity not found gracefully

## DON'T
- Mix read and write operations in same files
- Skip cache() wrapper on queries
- Skip "use server" on actions
- Use `getDbAsync()` for actions (use `getDb()` - actions need live request context)
- Use `getDb()` for build-time queries (use `getDbAsync()` for ISR/SSG)
- Write raw SQL queries
- Use inconsistent naming patterns within same entity
- Skip null checks for single entity queries