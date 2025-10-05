"use server"

import { cache } from "react"

import { posts, users } from "@nct/db"
import { gte, sql } from "drizzle-orm"

import { getDbAsync } from "@/lib/db"

export type DailyPoint = { date: string; users: number; posts: number }

function ymd(d: Date) {
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/**
 * Builds a zero-filled daily series for the last `days` days (inclusive of end).
 * endDate defaults to "today" on the server.
 */
export const getDailyActivity = cache(
  async (days = 90, endDate?: Date): Promise<DailyPoint[]> => {
    const db = await getDbAsync()

    const end = endDate ?? new Date()
    const start = addDays(
      new Date(end.getFullYear(), end.getMonth(), end.getDate()),
      -days + 1
    ) // inclusive

    // Aggregate users per day
    const usersRows = await db
      .select({
        day: sql<string>`DATE(${users.createdAt})`,
        cnt: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(gte(users.createdAt, sql`DATE(${ymd(start)})`))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`)

    // Aggregate posts per day
    const postsRows = await db
      .select({
        day: sql<string>`DATE(${posts.createdAt})`,
        cnt: sql<number>`COUNT(*)`,
      })
      .from(posts)
      .where(gte(posts.createdAt, sql`DATE(${ymd(start)})`))
      .groupBy(sql`DATE(${posts.createdAt})`)
      .orderBy(sql`DATE(${posts.createdAt})`)

    // Index by date for quick lookup
    const usersMap = new Map(usersRows.map((r) => [r.day, Number(r.cnt)]))
    const postsMap = new Map(postsRows.map((r) => [r.day, Number(r.cnt)]))

    // Zero-fill the full date range
    const out: DailyPoint[] = []
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const key = ymd(d)
      out.push({
        date: key,
        users: usersMap.get(key) ?? 0,
        posts: postsMap.get(key) ?? 0,
      })
    }
    return out
  }
)
