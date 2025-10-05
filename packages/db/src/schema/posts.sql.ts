// biome-ignore lint:performance/noNamespaceImport This is how Drizzle is recommended to be used
import * as t from "drizzle-orm/sqlite-core"
import { sqliteTable as table } from "drizzle-orm/sqlite-core"

import { timestamps } from "../utils"

export const posts = table("posts", {
  id: t.int("id").primaryKey({ autoIncrement: true }),
  userId: t.int("user_id").notNull(),
  title: t.text().notNull(),
  content: t.text(),
  ...timestamps,
})
