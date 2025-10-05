"use server"

import { revalidatePath } from "next/cache"

import { type SelectUser, users } from "@nct/db"
import { eq } from "drizzle-orm"

import { getDb } from "@/lib/db"

/**
 * Demo-only update function - returns success without persisting changes.
 * This allows users to interact with the demo (app.cording.dev) without modifying the database.
 */
export async function updateUserDemo(
  id: number,
  data: Partial<Omit<SelectUser, "id">>
): Promise<SelectUser | null> {
  const db = await getDb()

  // Fetch the existing user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  if (!existingUser[0]) {
    return null
  }

  // Return the user with the "updated" data merged in
  // but don't actually persist to the database
  return {
    ...existingUser[0],
    ...data,
  }
}
/**
 * Update the user by ID with the data
 */
export async function updateUser(
  id: number,
  data: Partial<Omit<SelectUser, "id">>
): Promise<SelectUser | null> {
  const db = await getDb()

  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()

  return result[0] || null
}

/**
 * Update the user by ID with the data. An example using revalidation
 */
export async function updateUserRevalidate(
  id: number,
  data: Partial<Omit<SelectUser, "id">>
): Promise<SelectUser | null> {
  const db = await getDb()

  const result = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()

  // Revalidate cached data
  revalidatePath("/users")
  revalidatePath(`/users/${id}`)

  return result[0] || null
}
