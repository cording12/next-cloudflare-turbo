import { cache } from "react"

import { posts, type SelectPost } from "@nct/db"
import { eq } from "drizzle-orm"

import { getDbAsync } from "@/lib/db"

export const getPostById = cache(
  async (id: number): Promise<SelectPost | null> => {
    const db = await getDbAsync()
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1)

    return result[0] || null
  }
)
