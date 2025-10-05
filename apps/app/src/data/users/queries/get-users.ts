"use server"

import { cache } from "react"

import { type SelectUser, users } from "@nct/db"

// Can run at request and build-time, therefore using the async version
import { getDbAsync } from "@/lib/db"

export const getUsers = cache(async (): Promise<SelectUser[]> => {
  const db = await getDbAsync()
  return await db.select().from(users)
})
