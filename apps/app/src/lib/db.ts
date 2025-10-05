// Example code: https://opennext.js.org/cloudflare/howtos/db#d1-example

import { cache } from "react"

import { createDrizzleD1 } from "@nct/db"
import { getCloudflareContext } from "@opennextjs/cloudflare"

export const getDb = cache(() => {
  const { env } = getCloudflareContext()
  return createDrizzleD1(env.DB)
})

// For static routes (i.e. ISR/SSG)
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true })
  return createDrizzleD1(env.DB)
})
