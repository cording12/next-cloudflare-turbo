export type DashboardMetrics = {
  totalUsers: number
  totalPosts: number
  activeAuthors: number
  postsPerUser: number
  roleCounts: Record<"admin" | "user" | "guest", number>
  mostActiveUser: {
    id: number
    firstName: string | null
    lastName: string | null
    posts: number
  } | null
}
