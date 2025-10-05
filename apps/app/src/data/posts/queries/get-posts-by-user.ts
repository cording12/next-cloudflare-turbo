import { cache } from "react"

import { posts, type SelectPost } from "@nct/db"
import { desc, eq } from "drizzle-orm"

import { getDbAsync } from "@/lib/db"

export const getPostsByUserId = cache(
  async (userId: number): Promise<SelectPost[]> => {
    const db = await getDbAsync()
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
  }
)
