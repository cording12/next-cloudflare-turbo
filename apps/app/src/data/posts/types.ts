import type { InsertPost, SelectPost } from "@nct/db"

// Add any post-specific derived types
export type CreatePostInput = Omit<
  InsertPost,
  "id" | "createdAt" | "updatedAt" | "deletedAt"
>
export type UpdatePostInput = Partial<Pick<SelectPost, "title" | "content">>

// Post with user information (for joins)
export type PostWithUser = SelectPost & {
  user: {
    id: number
    firstName: string | null
    lastName: string | null
    email: string
  }
}
