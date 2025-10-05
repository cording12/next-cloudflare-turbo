// biome-ignore lint:performance/noNamespaceImport This is how Drizzle is recommended to be used
import * as t from "drizzle-orm/sqlite-core"
import {
  type AnySQLiteColumn,
  sqliteTable as table,
} from "drizzle-orm/sqlite-core"

import { timestamps } from "../utils"

export const users = table(
  "users",
  {
    id: t.int().primaryKey({ autoIncrement: true }),
    firstName: t.text("first_name"),
    lastName: t.text("last_name"),
    email: t.text().notNull().unique(),
    invitee: t.int().references((): AnySQLiteColumn => users.id),
    role: t.text().$type<"guest" | "user" | "admin">().default("guest"),
    ...timestamps,
  },
  (tbl) => [t.uniqueIndex("email_idx").on(tbl.email)]
)
