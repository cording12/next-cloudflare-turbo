"use server"

import { type InsertPost, posts, type SelectPost } from "@nct/db"

import { getDbAsync } from "@/lib/db"

export async function createPost(
  data: Omit<InsertPost, "id" | "createdAt" | "updatedAt" | "deletedAt">
): Promise<SelectPost> {
  const db = await getDbAsync()

  const result = await db
    .insert(posts)
    .values({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  if (!result[0]) {
    throw new Error("Failed to create user")
  }

  return result[0]
}
