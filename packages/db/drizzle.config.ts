import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema",
  out: "./drizzle/migrations",
  driver: "d1-http",
})
