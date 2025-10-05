import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardMetrics } from "@/data/analytics/types"

type Props = { metrics: DashboardMetrics }

export function SectionCards({ metrics: m }: Props) {
  const pct = (num: number, den: number) =>
    den > 0 ? Math.round((num / den) * 100) : 0

  const authorsPct = pct(m.activeAuthors, m.totalUsers)
  const avgPosts = Number.isFinite(m.postsPerUser) ? m.postsPerUser : 0
  const mostActiveLabel = m.mostActiveUser
    ? `${m.mostActiveUser.firstName ?? ""} ${m.mostActiveUser.lastName ?? ""} (${m.mostActiveUser.posts})`.trim()
    : "—"

  const fmtInt = new Intl.NumberFormat("en-GB").format
  const fmtAvg = (n: number) => n.toFixed(2)

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 dark:*:data-[slot=card]:bg-card">
      {/* Total Users */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {fmtInt(m.totalUsers)}
          </CardTitle>
          <CardAction>
            <Badge className="text-chart-2" variant="outline">
              <IconTrendingUp />
              {fmtInt(m.roleCounts.admin)} admin · {fmtInt(m.roleCounts.user)}{" "}
              user · {fmtInt(m.roleCounts.guest)} guest
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Role distribution <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Counts by role (live)</div>
        </CardFooter>
      </Card>

      {/* Active Authors */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Authors</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {fmtInt(m.activeAuthors)}
          </CardTitle>
          <CardAction>
            <Badge className="text-chart-2" variant="outline">
              <IconTrendingUp />
              {authorsPct}% of users
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users with ≥1 post <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement snapshot</div>
        </CardFooter>
      </Card>

      {/* Total Posts */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Posts</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {fmtInt(m.totalPosts)}
          </CardTitle>
          <CardAction>
            <Badge className="text-chart-2" variant="outline">
              <IconTrendingUp />
              Avg {fmtAvg(avgPosts)} / user
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Content volume <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Total across all posts</div>
        </CardFooter>
      </Card>

      {/* Posts per User */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Posts per User</CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">
            {fmtAvg(avgPosts)}
          </CardTitle>
          <CardAction>
            <Badge className="text-chart-2" variant="outline">
              <IconTrendingUp />
              Top: {mostActiveLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Most active user <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Who's posting the most</div>
        </CardFooter>
      </Card>
    </div>
  )
}
