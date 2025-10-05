import { sql } from "drizzle-orm"
import { text } from "drizzle-orm/sqlite-core"

export const timestamps = {
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text("deleted_at"),
}
