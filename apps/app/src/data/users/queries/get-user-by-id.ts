import { cache } from "react"

import { type SelectUser, users } from "@nct/db"
import { eq } from "drizzle-orm"

// Can only run at request-time, therefore using the non-async version
import { getDb } from "@/lib/db"

export const getUserById = cache(
  async (id: number): Promise<SelectUser | null> => {
    const db = await getDb()
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0] || null
  }
)
