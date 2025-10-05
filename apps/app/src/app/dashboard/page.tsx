import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table/user/data-table"
import { SectionCards } from "@/components/section-cards"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDailyActivity, getDashboardMetrics } from "@/data/analytics"
import { getUsers } from "@/data/users"

export default async function Page() {
  const [users, metrics, activity] = await Promise.all([
    getUsers(),
    getDashboardMetrics(),
    getDailyActivity(90),
  ])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards metrics={metrics} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={activity} />
              </div>
              <DataTable data={users} rowsPerPage={10} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
