import fs from "node:fs"
import path from "node:path"

/**
 * Where your Cloudflare app lives relative to this config file
 */
const D1_ROOT = path.resolve(
  __dirname,
  "../../apps/app/.wrangler/state/v3/d1/miniflare-D1DatabaseObject"
)

/**
 * Recursively find the first *.sqlite file under D1_ROOT
 */
function findFirstSqlite(dir: string): string | null {
  if (!fs.existsSync(dir)) {
    return null
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isFile() && e.name.toLowerCase().endsWith(".sqlite")) {
      return full
    }
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      const found = findFirstSqlite(path.join(dir, e.name))
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * Turn an absolute path into a Drizzle-friendly file URL:
 * - Prefer a relative path from the current working directory
 * - Normalize backslashes to forward slashes
 */
function toFileUrl(absPath: string): string {
  // If Studio is run from packages/db (recommended), process.cwd() will be this folder
  let rel = path.relative(process.cwd(), absPath)
  if (!rel.startsWith(".")) {
    rel = `.${path.sep}${rel}`
  }
  const normalized = rel.split(path.sep).join("/") // forward slashes on Windows too
  return `file:${normalized}`
}

const sqliteAbs = findFirstSqlite(D1_ROOT)
if (!sqliteAbs) {
  console.error(
    `Could not find a .sqlite file under:\n  ${D1_ROOT}\n` +
      `Make sure you've run the app locally at least once so Miniflare creates the DB.`
  )
}

export default {
  schema: "./src/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: sqliteAbs ? toFileUrl(sqliteAbs) : "",
    // You can hardcode the value if this code doesn't work
    // url: "file:C:/project-root-filepath/apps/app/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/dbID.sqlite
  },
}
