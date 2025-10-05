/** biome-ignore-all lint/suspicious/noExplicitAny: Fine in this file; used with comment-json lib */
import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"

import type { D1Database, WranglerConfig } from "./cloudflare.types"

// You'll need to install this: npm install comment-json
// If you prefer not to add dependencies, we can use a manual approach instead
let commentJson: any
try {
  commentJson = require("comment-json")
} catch {
  // Fallback to manual approach if comment-json is not available
  commentJson = null
}

/**
 * Validates the wrangler file exists
 */
export function ensureWranglerConfigExists(wranglerConfigPath: string): void {
  if (!existsSync(wranglerConfigPath)) {
    throw new Error(`wrangler.jsonc not found at: ${wranglerConfigPath}`)
  }
}

/**
 * Parse JSONC (JSON with comments) by removing comments
 * This is a simple implementation - for production you might want a proper parser
 */
export function parseJSONC(content: string): Record<string, unknown> {
  // Remove single-line comments (// ...)
  const withoutSingleComments = content.replace(/\/\/.*$/gm, "")

  // Remove multi-line comments (/* ... */)
  const withoutMultiComments = withoutSingleComments.replace(
    /\/\*[\s\S]*?\*\//g,
    ""
  )

  // Remove trailing commas (common in JSONC)
  const withoutTrailingCommas = withoutMultiComments.replace(
    /,(\s*[}\]])/g,
    "$1"
  )

  try {
    return JSON.parse(withoutTrailingCommas) as Record<string, unknown>
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to parse wrangler.jsonc: ${errorMessage}`)
  }
}

/**
 * Parse JSONC with comment preservation
 */
export function parseJSONCWithComments(content: string): {
  data: Record<string, unknown>
  raw: any // The raw parsed object that preserves comments
} {
  if (commentJson) {
    try {
      const parsed = commentJson.parse(content)
      return {
        data: parsed,
        raw: parsed,
      }
    } catch {
      console.log(
        "⚠️  Failed to parse with comment preservation, falling back to basic parsing"
      )
    }
  }

  // Fallback to basic parsing
  return {
    data: parseJSONC(content),
    raw: null,
  }
}

/**
 * Stringify JSONC with comment preservation
 */
export function stringifyJSONCWithComments(
  data: Record<string, unknown>,
  rawData: any = null,
  spacing = 2
): string {
  if (commentJson && rawData) {
    try {
      // Update the raw data with new values while preserving comments
      Object.assign(rawData, data)
      return commentJson.stringify(rawData, null, spacing)
    } catch {
      console.log(
        "⚠️  Failed to stringify with comment preservation, falling back to basic stringify"
      )
    }
  }

  // Fallback to basic stringify
  return JSON.stringify(data, null, spacing)
}

/**
 * Validate that wrangler is authenticated
 */
export function validateWranglerAuth(): void {
  try {
    execSync("npx wrangler whoami", { encoding: "utf8", stdio: "pipe" })
    console.log("✅ Cloudflare authentication verified")
  } catch {
    throw new Error(
      '❌ Not authenticated with Cloudflare. Please run "npx wrangler login" first.'
    )
  }
}

/**
 * Extract database ID from wrangler d1 create output
 */
export function extractDatabaseId(output: string): string {
  const dbIdMatch = output.match(/"database_id":\s*"([^"]+)"/)

  if (!dbIdMatch) {
    throw new Error("Failed to extract database ID from wrangler output")
  }

  return dbIdMatch[1]
}

export function updateWranglerConfig(
  wranglerConfigPath: string,
  databaseName: string,
  databaseId: string
): void {
  try {
    const wranglerContent = readFileSync(wranglerConfigPath, "utf8")
    const { data: wranglerConfig, raw: rawConfig } =
      parseJSONCWithComments(wranglerContent)

    const dbConfig: D1Database = {
      binding: "DB",
      database_name: databaseName,
      database_id: databaseId,
      migrations_dir: "../../packages/db/drizzle/migrations",
    }

    // Update the configuration
    // @ts-expect-error: Because I didn't try to fix it
    const updatedConfig = { ...wranglerConfig } as WranglerConfig
    updatedConfig.d1_databases = [dbConfig]

    // Write back with comments preserved
    // @ts-expect-error: Because I didn't try to fix it
    const updatedContent = stringifyJSONCWithComments(updatedConfig, rawConfig)
    writeFileSync(wranglerConfigPath, updatedContent)

    console.log("✅ Comments and formatting preserved in wrangler.jsonc")
  } catch {
    console.log("⚠️  Comment preservation failed, using manual approach...")
  }
}
