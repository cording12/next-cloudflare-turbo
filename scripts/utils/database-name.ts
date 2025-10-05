/**
 * Sanitizes a database name to meet Cloudflare D1 requirements
 */
export function sanitizeDatabaseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-") // Replace invalid chars with hyphens
    .replace(/^[^a-z0-9]+/, "") // Remove invalid starting chars
    .replace(/[^a-z0-9]+$/, "") // Remove invalid ending chars
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .substring(0, 64) // Limit to 64 characters
}

/**
 * Validates the database name to ensure it meets Cloudflare D1 naming requirements
 */
export function validateDatabaseName(name: string): boolean {
  // D1 database names must be:
  // - 1-64 characters long
  // - Contain only lowercase letters, numbers, hyphens, and underscores
  // - Start with a letter or number
  // - Not end with a hyphen
  const nameRegex = /^[a-z0-9][a-z0-9_-]{0,62}[a-z0-9]$|^[a-z0-9]$/
  return nameRegex.test(name)
}
