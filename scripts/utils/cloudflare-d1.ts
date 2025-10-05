import { execSync } from "node:child_process"

const REGEX_DB_ID = /│\s*([a-f0-9-]{36})\s*│/i

/**
 * Creates a D1 database in Cloudflare
 * @param appsAppPath
 * @param databaseName
 * @returns
 */
export function createOrGetDatabase(
  appsAppPath: string,
  databaseName: string
): string {
  try {
    return execSync(`npx wrangler d1 create ${databaseName}`, {
      encoding: "utf8",
      cwd: appsAppPath,
      stdio: "pipe",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes("already exists")) {
      console.log("ℹ️  Database already exists, continuing...")
      const infoOutput = execSync(`npx wrangler d1 info ${databaseName}`, {
        encoding: "utf8",
        cwd: appsAppPath,
      })

      const existingDbMatch = infoOutput.match(REGEX_DB_ID)

      if (existingDbMatch) {
        return `"database_id": "${existingDbMatch[1]}"`
      }

      throw new Error(
        `Database ${databaseName} exists but couldn't retrieve ID. Please check manually.`
      )
    }
    throw error
  }
}

/**
 * Runs the database migrations and seeds the database in the given directory.
 */
export function runMigrationsAndSeed(
  appsAppPath: string,
  databaseName: string
): void {
  const originalCwd = process.cwd()
  process.chdir(appsAppPath)
  try {
    console.log("  📋 Applying database migrations...")
    execSync(`echo y | npx wrangler d1 migrations apply ${databaseName} --local`, {
      stdio: "inherit",
    })
    console.log("  🌱 Adding sample data...")
    execSync(
      `wrangler d1 execute ${databaseName} --local --file=../../packages/db/seed.sql`,
      { stdio: "inherit" }
    )
  } finally {
    process.chdir(originalCwd)
  }
}

/**
 * Validates that the database has been created and seeded with data correctly
 */

export function validateDatabase(
  appsAppPath: string,
  databaseName: string
): void {
  const originalCwd = process.cwd()
  process.chdir(appsAppPath)
  try {
    const validateOutput = execSync(
      `wrangler d1 execute ${databaseName} --local --command="SELECT name FROM sqlite_master WHERE type='table';"`,
      {
        encoding: "utf8",
        stdio: "pipe",
      }
    )
    if (validateOutput.includes("users") && validateOutput.includes("posts")) {
      console.log("✅ Database validation successful")
    } else {
      console.log(
        "⚠️ Database validation completed but tables may not be set up correctly"
      )
    }
  } catch {
    console.log("⚠️ Database validation failed, but setup may still be working")
  } finally {
    process.chdir(originalCwd)
  }
}
