import { cache } from "react"

import { posts, users } from "@nct/db"
import { desc, eq, isNull } from "drizzle-orm"

import type { PostWithUser } from "../types"

import { getDbAsync } from "@/lib/db"

export const getPostsWithUsers = cache(async (): Promise<PostWithUser[]> => {
  const db = await getDbAsync()

  const result = await db
    .select({
      // Post fields
      id: posts.id,
      userId: posts.userId,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      deletedAt: posts.deletedAt,
      // User fields
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      },
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(isNull(posts.deletedAt)) // Only non-deleted posts
    .orderBy(desc(posts.createdAt))

  return result
})

export const getPostWithUserById = cache(
  async (id: number): Promise<PostWithUser | null> => {
    const db = await getDbAsync()

    const result = await db
      .select({
        // Post fields
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        content: posts.content,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        deletedAt: posts.deletedAt,
        // User fields
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id))
      .limit(1)

    return result[0] || null
  }
)
