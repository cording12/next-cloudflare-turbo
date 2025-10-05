import { execSync } from "node:child_process"
import { join } from "node:path"
import { createInterface } from "node:readline"

import {
  createOrGetDatabase,
  runMigrationsAndSeed,
  validateDatabase,
} from "./utils/cloudflare-d1"
import {
  sanitizeDatabaseName,
  validateDatabaseName,
} from "./utils/database-name"
import { updatePackageJsonScripts } from "./utils/package-json-config"
import {
  ensureWranglerConfigExists,
  extractDatabaseId,
  updateWranglerConfig,
  validateWranglerAuth,
} from "./utils/wrangler-config"

/**
 * Prompts the user for a database name with a default fallback
 */
// biome-ignore lint/suspicious/useAwait: Must be async
async function promptForDatabaseName(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    const defaultName = "next-cloudflare-turbo"

    rl.question(
      `📝 Enter database name (default: ${defaultName}): `,
      (answer) => {
        rl.close()
        const databaseName = answer.trim() || defaultName
        console.log(`✅ Using database name: ${databaseName}`)
        resolve(databaseName)
      }
    )
  })
}

/**
 * Database setup script for Next-Cloudflare-Turbo
 * This script:
 * 1. Creates a D1 database
 * 2. Updates wrangler.jsonc with database ID
 * 3. Runs migrations and seeds data
 */
async function setupDatabase(): Promise<void> {
  try {
    console.log("🚀 Setting up your database...")
    console.log("")

    const projectRoot = process.cwd()
    const appsAppPath = join(projectRoot, "apps", "app")
    const wranglerConfigPath = join(appsAppPath, "wrangler.jsonc")
    const packageJsonPath = join(appsAppPath, "package.json")

    ensureWranglerConfigExists(wranglerConfigPath)

    console.log("🔐 Checking Cloudflare authentication...")
    console.log("")
    validateWranglerAuth()

    let databaseName = await promptForDatabaseName()
    if (!validateDatabaseName(databaseName)) {
      const originalName = databaseName
      databaseName = sanitizeDatabaseName(databaseName)
      console.log(
        `⚠️  Database name "${originalName}" was sanitized to "${databaseName}" to meet Cloudflare D1 requirements`
      )

      if (!databaseName) {
        databaseName = "next-cloudflare-turbo"
        console.log(`⚠️  Using fallback name: ${databaseName}`)
      }
    }

    console.log("")
    console.log("📦 Creating D1 database...")
    const output = createOrGetDatabase(appsAppPath, databaseName)
    const databaseId = extractDatabaseId(output)
    console.log(`✅ Database created with ID: ${databaseId}`)
    console.log("")

    console.log("⚙️  Updating wrangler configuration...")
    updateWranglerConfig(wranglerConfigPath, databaseName, databaseId)
    console.log("✅ wrangler.jsonc updated successfully")

    console.log("🗄️  Setting up database tables...")
    runMigrationsAndSeed(appsAppPath, databaseName)

    console.log("🔍 Validating database setup...")
    validateDatabase(appsAppPath, databaseName)

    console.log("📋 Updating package.json scripts...")
    updatePackageJsonScripts(packageJsonPath, databaseName)

    // Format
    try {
      execSync(
        `npx ultracite format ${wranglerConfigPath} ${packageJsonPath}`,
        {
          stdio: "pipe",
          cwd: appsAppPath,
        }
      )
      console.log("✅ Configuration files formatted with ultracite")
    } catch {
      console.log(
        "⚠️  Failed to format configuration files, but setup completed successfully"
      )
    }

    console.log("")
    console.log("🎉 Database setup complete!")
    console.log(`📊 Database: ${databaseName}`)
    console.log("📍 Next steps:")
    console.log('   1. Run "turbo run dev" to start your app locally')
    console.log("   2. Visit http://localhost:3000 to see your app")
    console.log('   3. When ready, run "npm run setup:remote-db" to deploy')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error("")
    console.error("❌ Database setup failed:")
    console.error(`   ${errorMessage}`)
    console.error("")
    console.error("🔧 Troubleshooting:")
    console.error("   • Ensure you have a Cloudflare account")
    console.error('   • Run "npx wrangler login" if not authenticated')
    console.error("   • Check that you have the correct Node.js version (v22+)")
    console.error("   • Make sure you're running this from the project root")
    console.error(
      "   • Database names must be 1-64 chars, lowercase letters/numbers/hyphens/underscores only"
    )
    console.error("")
    process.exit(1)
  }
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error("Unhandled error:", error)
    process.exit(1)
  })
}

export { setupDatabase }
