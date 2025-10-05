import type { D1Database } from "@cloudflare/workers-types"
import { drizzle } from "drizzle-orm/d1"

export * from "./schema/posts.sql"
export * from "./schema/users.sql"
export * from "./types/posts.types"
export * from "./types/users.types"

import { posts } from "./schema/posts.sql"
import { users } from "./schema/users.sql"

export const schema = {
  users,
  posts,
} as const

// Connection factory - called in Workers
export function createDrizzleD1(d1: D1Database) {
  return drizzle(d1, { schema })
}

export type Database = ReturnType<typeof createDrizzleD1>
