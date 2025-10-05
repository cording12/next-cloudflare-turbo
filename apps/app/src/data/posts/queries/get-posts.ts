import { cache } from "react"

import { posts, type SelectPost } from "@nct/db"
import { desc } from "drizzle-orm"

import { getDbAsync } from "@/lib/db"

export const getPosts = cache(async (): Promise<SelectPost[]> => {
  const db = await getDbAsync()
  return await db.select().from(posts).orderBy(desc(posts.createdAt))
})
