---
applyTo: "apps/app/**"
---

# Next.js App Router Patterns on Cloudflare Workers

## Project Context
Main Next.js application running on Cloudflare Workers via OpenNext adapter. Uses App Router with Server Components and Server Actions.

## File Structure Patterns
```
apps/app/src/
├── app/                  # Next.js App Router pages & layouts
│   ├── dashboard/        # Dashboard page with data fetching
│   ├── posts/            # Posts listing page
│   ├── users/            # Users management page
│   ├── layout.tsx        # Root layout with fonts and theme
│   └── page.tsx          # Home page
├── components/           # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── data-table/       # Complex table components
│   └── sidebar/          # Navigation components
├── data/                 # Data access layer (queries & actions)
├── lib/                  # Utilities & configurations
│   ├── db.ts             # Database connection factory
│   └── utils.ts          # Utility functions (cn, etc.)
├── hooks/                # Custom React hooks
└── globals.css           # Global styles
```

## Database Access Pattern
ALWAYS use the connection factory from lib/db.ts:

```tsx
import { getDb, getDbAsync } from "@/lib/db"

// For live user requests (Server Actions, dynamic Server Components)
const db = await getDb()

// For build-time operations (ISR, SSG, static queries)
const db = await getDbAsync()
```

## Component Patterns

### Server Components (Preferred Pattern)
```tsx
// apps/app/src/app/dashboard/page.tsx
import { getDailyActivity, getDashboardMetrics } from "@/data/analytics"
import { getUsers } from "@/data/users"

export default async function Page() {
  const [users, metrics, activity] = await Promise.all([
    getUsers(),
    getDashboardMetrics(),
    getDailyActivity(90),
  ])

  return (
    <div>
      <SectionCards metrics={metrics} />
      <ChartAreaInteractive data={activity} />
      <DataTable data={users} rowsPerPage={10} />
    </div>
  )
}
```

### Client Components (For Interactivity)
```tsx
"use client"

import { useState } from "react"
import { updateUser } from "@/data/users/actions"
import { toast } from "sonner"

export function UserForm({ user }: { user: SelectUser }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    try {
      const updatedData = {
        firstName: (formData.get("firstName") as string) ?? "",
        lastName: (formData.get("lastName") as string) ?? "",
        email: (formData.get("email") as string) ?? "",
      }

      await updateUser(user.id, updatedData)
      // Handle success (e.g., close modal, show toast)
    } catch (error) {
      toast("Error while updating record", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

## Import Patterns
```tsx
// Database schema & types (always from @nct/db package)
import { users, type SelectUser, type InsertUser } from "@nct/db"

// Data layer functions
import { getUsers, getUserById } from "@/data/users"
import { createUser, updateUser } from "@/data/users/actions"
import { getDashboardMetrics } from "@/data/analytics"

// Drizzle operators
import { eq, desc, and, isNull } from "drizzle-orm"

// Next.js utilities (when needed)
import { revalidatePath } from "next/cache"
import { redirect, notFound } from "next/navigation"

// UI components
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/user/data-table"

// Utilities
import { cn } from "@/lib/utils"
```

## Error Handling Patterns

### In Server Components
```tsx
import { notFound } from "next/navigation"

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUserById(Number(params.id))
  
  if (!user) {
    notFound() // Triggers 404 page
  }
  
  return <div>User: {user.firstName}</div>
}
```

### In Client Components (Actions)
```tsx
"use client"

import { toast } from "sonner"

const handleAction = async () => {
  try {
    const result = await updateUser(user.id, updatedData)
    if (result) {
      toast("User updated successfully")
    } else {
      toast("User not found")
    }
  } catch (error) {
    toast("Error while updating user", {
      description: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
```

## Routing and Navigation

### App Router Pages
```tsx
// apps/app/src/app/posts/page.tsx
import { getPostsWithUsers } from "@/data/posts"

export default async function PostsPage() {
  const posts = await getPostsWithUsers()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-bold text-4xl">Posts</h1>
      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <PostGrid posts={posts} />
      )}
    </div>
  )
}
```

### Layout Pattern
```tsx
// apps/app/src/app/layout.tsx
import { Inter, Roboto_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme/theme-provider"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const dynamic = "force-dynamic" // Important for Cloudflare Workers

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Styling and UI Patterns

### Tailwind CSS Usage
```tsx
// Standard component styling
<div className="container mx-auto px-4 py-8">
  <h1 className="font-bold text-4xl tracking-tight">Title</h1>
  <p className="mt-2 text-muted-foreground">Description</p>
</div>

// Conditional styling with cn()
<Button
  className={cn(
    "transition-shadow duration-200 hover:shadow-lg",
    isActive && "bg-primary text-primary-foreground"
  )}
>
  Click me
</Button>
```

### shadcn/ui Components
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Usage follows shadcn/ui patterns
<Card className="transition-shadow duration-200 hover:shadow-lg">
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center space-x-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
      </Avatar>
      <Badge variant="secondary">User</Badge>
    </div>
  </CardContent>
</Card>
```

## Complex Component Patterns

### Data Tables with Actions
```tsx
// Complex interactive components like DataTable use controlled state
"use client"

import { useState } from "react"
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"

export function DataTable({ data }: { data: SelectUser[] }) {
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, pagination },
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  })

  return <TableImplementation table={table} />
}
```

### Forms with Server Actions
```tsx
// Forms that submit to Server Actions
"use client"

import { updateUser } from "@/data/users/actions"

export function UserEditForm({ user }: { user: SelectUser }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    try {
      await updateUser(user.id, {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
      })
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit}>
      <Input name="firstName" defaultValue={user.firstName ?? ""} />
      <Input name="lastName" defaultValue={user.lastName ?? ""} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}
```

## Performance Patterns

### Parallel Data Fetching
```tsx
// Fetch multiple data sources in parallel
export default async function Dashboard() {
  const [users, metrics, activity] = await Promise.all([
    getUsers(),
    getDashboardMetrics(),
    getDailyActivity(90),
  ])

  return <DashboardLayout users={users} metrics={metrics} activity={activity} />
}
```

## DO (App Level)
- Use Server Components by default for data fetching
- Import types from @nct/db package exclusively
- Use connection factory functions (getDb/getDbAsync)
- Handle errors gracefully with try/catch in client components
- Use notFound() for missing resources in Server Components
- Prefer Server Actions over API routes
- Use TypeScript strict mode throughout
- Import utilities from @/lib/* consistently
- Use shadcn/ui components for consistent styling
- Include "use client" directive for interactive components
- Use parallel data fetching with Promise.all()
- Use toast notifications for user feedback

## DON'T (App Level)
- Use Node.js built-ins (not available in Cloudflare Workers)
- Create direct database connections (use factory functions)
- Use useEffect for data fetching (use Server Components instead)
- Skip error handling in data operations
- Use any types (strict TypeScript enforced)
- Hardcode environment variables in components
- Use synchronous operations where async is available
- Skip loading states in interactive components
- Use localStorage/sessionStorage in Server Components
- Import from packages that require Node.js APIs

## Environment-Specific Notes
- All components run on Cloudflare Workers edge runtime
- Server Components execute during request/build time
- Client Components are hydrated in the browser
- No Node.js APIs available - use Web APIs instead
- Use Web Standards: fetch, crypto.subtle, TextEncoder
- Date handling uses .toISOString() for consistency