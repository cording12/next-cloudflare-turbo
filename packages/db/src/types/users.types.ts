import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

import type { users } from "../schema/users.sql"

export type SelectUser = InferSelectModel<typeof users>
export type InsertUser = InferInsertModel<typeof users>

export const USER_ROLES = ["guest", "user", "admin"] as const
export type UserRole = (typeof USER_ROLES)[number]
