"use server"

import { posts } from "@nct/db"
import { eq } from "drizzle-orm"

import { getDbAsync } from "@/lib/db"

export async function deletePost(id: number): Promise<boolean> {
  const db = await getDbAsync()

  // First get the post to know which user's posts to revalidate
  const existingPost = await db
    .select({ userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (!existingPost[0]) {
    return false
  }

  // Soft delete by setting deletedAt
  const result = await db
    .update(posts)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, id))
    .returning()

  if (result[0]) {
    // Revalidate relevant paths
    // revalidatePath("/posts")
    // revalidatePath(`/posts/${id}`)
    // revalidatePath(`/users/${existingPost[0].userId}/posts`)
    return true
  }

  return false
}

// Alternative: Hard delete function if needed
export async function hardDeletePost(id: number): Promise<boolean> {
  const db = await getDbAsync()

  // First get the post to know which user's posts to revalidate
  const existingPost = await db
    .select({ userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (!existingPost[0]) {
    return false
  }

  const result = await db.delete(posts).where(eq(posts.id, id)).returning()

  if (result[0]) {
    // Revalidate relevant paths
    // revalidatePath("/posts")
    // revalidatePath(`/users/${existingPost[0].userId}/posts`)
    return true
  }

  return false
}
