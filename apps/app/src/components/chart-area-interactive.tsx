/** biome-ignore-all lint/style/useAtIndex: Demo code */
/** biome-ignore-all lint/style/noNestedTernary: Demo code */
"use client"

import * as React from "react"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"

export type ActivityPoint = { date: string; users: number; posts: number }
type Props = {
  data: ActivityPoint[] // daily array, already zero-filled
  title?: string // optional (default: "Activity")
  defaultRange?: "90d" | "30d" | "7d"
}

const chartConfig = {
  users: { label: "New Users", color: "var(--chart-1)" },
  posts: { label: "Posts", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ChartAreaInteractive({
  data,
  title = "Activity",
  defaultRange = "90d",
}: Props) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">(
    defaultRange
  )

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Use the last date in the dataset as the reference (works with seeded timelines)
  const referenceDate = React.useMemo(() => {
    if (!data.length) {
      return new Date()
    }
    return new Date(`${data[data.length - 1]?.date ?? ""}T00:00:00`)
  }, [data])

  const filteredData = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const start = new Date(referenceDate)
    start.setDate(start.getDate() - (days - 1))
    return data.filter((d) => new Date(d.date) >= start)
  }, [data, timeRange, referenceDate])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Total for the selected range
          </span>
          <span className="@[540px]/card:hidden">Selected range</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            className="*:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex hidden"
            onValueChange={(v) => v && setTimeRange(v as typeof timeRange)}
            type="single"
            value={timeRange}
            variant="outline"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          <Select
            onValueChange={(v) => setTimeRange(v as typeof timeRange)}
            value={timeRange}
          >
            <SelectTrigger
              aria-label="Select a value"
              className="flex @[767px]/card:hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
              size="sm"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem className="rounded-lg" value="90d">
                Last 3 months
              </SelectItem>
              <SelectItem className="rounded-lg" value="30d">
                Last 30 days
              </SelectItem>
              <SelectItem className="rounded-lg" value="7d">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillUsers" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-users)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPosts" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-posts)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-posts)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="date"
              minTickGap={32}
              tickFormatter={(value) => {
                const d = new Date(`${value}T00:00:00`)
                return d.toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                })
              }}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
              cursor={false}
            />
            <Area
              dataKey="posts"
              fill="url(#fillPosts)"
              name={chartConfig.posts.label}
              stackId="a"
              stroke="var(--color-posts)"
              type="natural"
            />
            <Area
              dataKey="users"
              fill="url(#fillUsers)"
              name={chartConfig.users.label}
              stackId="a"
              stroke="var(--color-users)"
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
