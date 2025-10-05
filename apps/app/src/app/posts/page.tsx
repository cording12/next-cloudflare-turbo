import Link from "next/link"

import { CalendarDays, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPostsWithUsers } from "@/data/posts"

function getInitials(
  firstName: string | null,
  lastName: string | null
): string {
  const first = firstName?.charAt(0) || ""
  const last = lastName?.charAt(0) || ""
  return `${first}${last}`.toUpperCase() || "U"
}

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return "Unknown"
  }
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "Unknown"
  }
}

function getFullName(
  firstName: string | null,
  lastName: string | null
): string {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : "Anonymous User"
}

export default async function PostsPage() {
  const posts = await getPostsWithUsers()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-bold text-4xl tracking-tight">Posts</h1>
        <p className="mt-2 text-muted-foreground">
          Discover what our community is sharing
        </p>

        <Button asChild className="mt-4">
          <Link href="/dashboard">{"<-"} Back to dashboard</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No posts yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share something with the community!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {posts.map((post) => (
            <Card
              className="transition-shadow duration-200 hover:shadow-lg"
              key={post.id}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {getInitials(post.user.firstName, post.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm leading-none">
                        {getFullName(post.user.firstName, post.user.lastName)}
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {post.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge className="shrink-0" variant="secondary">
                    Post #{post.id}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="mb-2 text-xl leading-tight">
                      {post.title}
                    </CardTitle>
                    {post.content && (
                      <CardDescription className="text-base leading-relaxed">
                        {post.content}
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex items-center border-t pt-3 text-muted-foreground text-xs">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    Published {formatDate(post.createdAt)}
                    {post.updatedAt !== post.createdAt && (
                      <span className="ml-2">
                        • Updated {formatDate(post.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
