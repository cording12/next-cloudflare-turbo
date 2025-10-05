"use server"
import { cache } from "react"

import { posts, users } from "@nct/db"
import { count, countDistinct, desc, eq, sql } from "drizzle-orm"

import type { DashboardMetrics } from "../types"

import { getDbAsync } from "@/lib/db"

export const getDashboardMetrics = cache(
  async (): Promise<DashboardMetrics> => {
    const db = await getDbAsync()

    const totalUsersRow = await db.select({ cnt: count() }).from(users)
    const totalUsers = totalUsersRow[0]?.cnt ?? 0

    const totalPostsRow = await db.select({ cnt: count() }).from(posts)
    const totalPosts = totalPostsRow[0]?.cnt ?? 0

    const activeAuthorsRow = await db
      .select({ cnt: countDistinct(posts.userId) })
      .from(posts)
    const activeAuthors = activeAuthorsRow[0]?.cnt ?? 0

    const postsPerUser = totalUsers
      ? Number(totalPosts) / Number(totalUsers)
      : 0

    // Role breakdown
    const roleRows = await db
      .select({
        role: users.role,
        cnt: count(),
      })
      .from(users)
      .groupBy(users.role)

    const roleCounts: DashboardMetrics["roleCounts"] = {
      admin: 0,
      user: 0,
      guest: 0,
    }
    for (const r of roleRows) {
      if (r.role === "admin" || r.role === "user" || r.role === "guest") {
        roleCounts[r.role] = Number(r.cnt)
      }
    }

    // Most active user (by post count)
    const mostActive = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        posts: sql<number>`COUNT(${posts.id})`,
      })
      .from(users)
      .leftJoin(posts, eq(users.id, posts.userId))
      .groupBy(users.id)
      .orderBy(desc(sql`COUNT(${posts.id})`))
      .limit(1)

    let mostActiveUser: DashboardMetrics["mostActiveUser"] = null

    if (mostActive[0]) {
      mostActiveUser = {
        id: mostActive[0].id,
        firstName: mostActive[0].firstName,
        lastName: mostActive[0].lastName,
        posts: Number(mostActive[0].posts ?? 0),
      }
    }

    return {
      totalUsers: Number(totalUsers),
      totalPosts: Number(totalPosts),
      activeAuthors: Number(activeAuthors),
      postsPerUser,
      roleCounts,
      mostActiveUser,
    }
  }
)
