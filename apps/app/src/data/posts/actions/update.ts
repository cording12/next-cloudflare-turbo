"use server"

import { posts, type SelectPost } from "@nct/db"
import { eq } from "drizzle-orm"

import { getDbAsync } from "@/lib/db"

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
