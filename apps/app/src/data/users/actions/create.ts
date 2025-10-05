"use server"

import { type SelectUser, users } from "@nct/db"

import { getDb } from "@/lib/db"

export async function createUser(
  data: Omit<SelectUser, "id">
): Promise<SelectUser> {
  const db = await getDb()

  const result = await db.insert(users).values(data).returning()

  if (!result[0]) {
    throw new Error("Failed to create user")
  }

  return result[0]
}
