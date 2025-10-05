import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

import type { posts } from "../schema/posts.sql"

export type SelectPost = InferSelectModel<typeof posts>
export type InsertPost = InferInsertModel<typeof posts>
