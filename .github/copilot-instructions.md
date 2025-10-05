# Next-Cloudflare-Turbo Repository Instructions

## Architecture Overview
Next.js monorepo application running on Cloudflare Workers via OpenNext Cloudflare Adapter. This is NOT a traditional Node.js environment.

## Runtime Environment
- **Runtime**: Cloudflare Workers (V8 isolates, not Node.js)
- **Framework**: Next.js 15+ with App Router, Server Components, and Server Actions
- **Database**: Cloudflare D1 (SQLite) accessed via Drizzle ORM
- **Storage**: Cloudflare R2 for object storage
- **Monorepo**: Turborepo managing apps/* and packages/*
- **Language**: TypeScript strict mode (no any types)

## Project Structure
```
next-cloudflare-turbo/
├── apps/
│   └── app/                 # Main Next.js application
│       ├── src/
│       │   ├── app/        # Next.js App Router pages
│       │   ├── components/ # React components
│       │   ├── data/       # Data access layer (queries & actions)
│       │   └── lib/        # Utilities (db connection, etc.)
│       └── wrangler.jsonc  # Cloudflare configuration
├── packages/
│   └── db/                 # Shared database package (@nct/db)
│       ├── src/
│       │   ├── schema/     # Drizzle schema definitions
│       │   └── types/      # Type exports
│       └── drizzle/        # Migration files
└── .github/
    └── instructions/       # Path-specific Copilot instructions
```

## Universal Constraints (Cloudflare Workers)
- **No Node.js APIs**: Cannot use fs, path, crypto (Node.js version), util, etc.
- **Use Web APIs**: fetch, crypto.subtle, TextEncoder, URL, etc.
- **Edge Runtime**: Code runs in V8 isolates, not Node.js processes
- **ISO Date Strings**: Use `.toISOString()` for dates (no Node.js date utilities)

## Package Import Patterns
```tsx
// Database schema & types (always from @nct/db package)
import { users, type SelectUser, type InsertUser } from "@nct/db"

// Drizzle ORM operations
import { eq, desc, and, or, isNull, like } from "drizzle-orm"

// Cloudflare context access (for accessing bindings)
import { getCloudflareContext } from "@opennextjs/cloudflare"

// Next.js utilities
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect, notFound } from "next/navigation"

// React utilities
import { cache } from "react"
```

## Database Connection Pattern
```tsx
import { getDb, getDbAsync } from "@/lib/db"

// For request-time operations (Server Actions, dynamic Server Components)
// Use when you need live user context and Cloudflare context is available synchronously
const db = await getDb()

// For build-time + request-time operations (ISR, SSG, cached queries)
// Use when code might run during static generation
const db = await getDbAsync()
```

## Server Functions Pattern
```tsx
// All data access functions must use "use server"
"use server"

// Query functions (read-only) - can run at build-time and request-time
export const getEntity = cache(async (): Promise<Entity[]> => {
  const db = await getDbAsync() // Use getDbAsync for ISR/SSG compatibility
  return await db.select().from(entities)
})

// Action functions (mutations) - only run at request-time
export async function createEntity(data: EntityData) {
  const db = await getDb() // Use getDb for live user requests only
  // ... mutation logic
  revalidatePath("/entities") // Always revalidate after mutations
}
```

## Error Handling Approach
```tsx
// In Server Actions - return structured results
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  console.error("Operation failed:", error)
  return { success: false, error: "User-friendly message" }
}

// In Server Components - use Next.js error boundaries
import { notFound } from "next/navigation"

const entity = await getEntityById(id)
if (!entity) {
  notFound()
}
```

## Cloudflare Context Access
```tsx
import { getCloudflareContext } from "@opennextjs/cloudflare"

// In Server Components/Actions (request-time)
const { env, cf, ctx } = getCloudflareContext()
const db = env.DB           // D1 Database binding
const bucket = env.R2       // R2 Storage binding

// For static/ISR routes (build-time)
const { env } = await getCloudflareContext({ async: true })
```

## Database Management Context
**Important**: Wrangler commands for database operations must be run from application directories (like `apps/app/`), NOT from the database package directory (`packages/db/`). This is because:

- Wrangler requires `wrangler.jsonc` configuration file
- Database bindings are defined in the app's wrangler configuration
- Migration paths are configured relative to the app directory

```bash
# ❌ DON'T: Run from packages/db
cd packages/db
npm run db:migrate:local  # This will fail

# ✅ DO: Run from apps/app  
cd apps/app
npm run db:migrate:local  # This works
```

**Workflow**:
1. **Schema changes**: Modify files in `packages/db/src/schema/`
2. **Generate migrations**: Run `npm run db:generate` from `packages/db/`
3. **Apply migrations**: Run `npm run db:migrate:local` from `apps/app/`

## Universal Rules

### Writing Style
- Always spell in British English
- No emojis in code or comments
- Use hyphens (-) not em dashes
- Use single quotes (') for apostrophes

### DO (Repository-wide)
- Use TypeScript strict mode (no any types)
- Use "use server" directive for all data access functions
- Import types from @nct/db package exclusively
- Use Drizzle ORM query builder (never raw SQL)
- Handle errors gracefully with try/catch blocks
- Use Web APIs instead of Node.js built-ins
- Use explicit return types for functions
- Use `.toISOString()` for date handling
- Call `revalidatePath()` after data mutations
- Use connection factory functions (`getDb`/`getDbAsync`)
- Run wrangler commands from app directories, not package directories

### DON'T (Repository-wide)
- Use Node.js built-ins (fs, path, crypto, util, etc.)
- Use localStorage or sessionStorage in React artifacts
- Write raw SQL queries
- Create direct database connections
- Use synchronous file operations
- Use any types or skip type annotations
- Skip error handling in data operations
- Skip revalidation after mutations
- Hardcode environment variables or credentials
- Use inconsistent naming conventions
- Run wrangler/database commands from packages/db directory

## Development Workflow

### Database Schema Changes
1. Modify schema in `packages/db/src/schema/`
2. Generate migration: `npm run db:generate` (from `packages/db/`)
3. Apply migration: `npm run db:migrate:local` (from `apps/app/`)

### Code Organization
- **Queries** (read operations): Use `cache()` wrapper and `getDbAsync()` for ISR/SSG compatibility
- **Actions** (write operations): Return result objects and use `getDb()` for live request context
- **Components**: Prefer Server Components, use Client Components for interactivity
- **Types**: Import from `@nct/db`, create derived types in data layer

## Response Format Preferences
When generating code, always:
- Include necessary import statements
- Use explicit return types
- Add brief comments for Cloudflare Worker-specific patterns
- Show file paths and directory context
- Include error handling for data operations
- Follow established naming conventions
- Specify correct directory for wrangler commands

## Common Debugging Tips
- "X is not defined" → Using Node.js built-in, switch to Web API
- Database connection errors → Check using correct factory function
- Type errors → Verify importing types from @nct/db
- Migration failures → Ensure running from correct directory (apps/app for applying)
- "wrangler command not found" → Run wrangler commands from app directories with wrangler.jsonc

## Environment-Specific Notes
- Server Components and Server Actions run on the edge
- Middleware runs on every request at the edge
- API Routes become Cloudflare Worker endpoints
- Build-time operations use different context than request-time
- Database migrations require wrangler.jsonc context from application directories