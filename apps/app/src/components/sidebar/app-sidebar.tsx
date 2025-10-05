"use client"

import type * as React from "react"

import { navItems } from "./nav-items"

import { Logo } from "@/components/logo"
import { NavDocuments } from "@/components/sidebar/nav-documents"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 cursor-pointer"
            >
              <a href="#">
                <Logo className="!size-5 text-primary" />
                <span className="font-semibold text-base">@nct</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems.navMain} />
        <NavDocuments items={navItems.documents} />
        <NavSecondary className="mt-auto" items={navItems.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navItems.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
