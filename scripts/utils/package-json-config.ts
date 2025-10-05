import { readFileSync, writeFileSync } from "node:fs"

/**
 * Updates package.json scripts to use the correct database name
 */
export function updatePackageJsonScripts(
  packageJsonPath: string,
  newDatabaseName: string
): void {
  try {
    const packageContent = readFileSync(packageJsonPath, "utf8")
    const packageJson = JSON.parse(packageContent)

    if (!packageJson.scripts) {
      console.log("⚠️  No scripts found in package.json")
      return
    }

    let updatedCount = 0
    const oldDatabaseName = "next-cloudflare-turbo"

    // Update scripts that contain wrangler d1 commands with the old database name
    for (const [scriptName, scriptCommand] of Object.entries(
      packageJson.scripts
    )) {
      if (
        typeof scriptCommand === "string" &&
        scriptCommand.includes(oldDatabaseName)
      ) {
        packageJson.scripts[scriptName] = scriptCommand.replace(
          new RegExp(oldDatabaseName, "g"),
          newDatabaseName
        )
        updatedCount++
      }
    }

    if (updatedCount > 0) {
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log(`✅ Updated ${updatedCount} database scripts in package.json`)
    } else {
      console.log("ℹ️  No database scripts needed updating in package.json")
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`⚠️  Failed to update package.json: ${errorMessage}`)
    // Don't throw - this is not critical enough to fail the entire setup
  }
}