"use server"

import { users } from "@nct/db"
import { eq } from "drizzle-orm"

import { getDb } from "@/lib/db"

export async function deleteUser(id: number): Promise<void> {
  const db = await getDb()

  await db.delete(users).where(eq(users.id, id))
}
