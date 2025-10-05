"use client"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { useParams, usePathname } from "next/navigation"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"

import { getSectionAndPage } from "@/lib/analytics"
import { cn } from "@/lib/cn"

export function useMode(): string | undefined {
  const { slug } = useParams()
  return Array.isArray(slug) && slug.length > 0 ? slug[0] : undefined
}

export function Body({
  children,
  posthogKey,
}: {
  children: ReactNode
  posthogKey?: string
}): React.ReactElement {
  const mode = useMode()
  const pathname = usePathname()

  useEffect(() => {
    if (!posthogKey) {
      return
    }

    if (!posthog.__loaded && typeof posthogKey === "string") {
      posthog.init(posthogKey, {
        api_host: "/nct",
        ui_host: "https://eu.posthog.com",
        person_profiles: "always",
        capture_pageview: true,
        capture_pageleave: true,
        debug: process.env.NODE_ENV === "development",
      })

      const { section, page } = getSectionAndPage(pathname)
      posthog.register({ section, page })
    }
  }, [posthogKey, pathname])

  return (
    <PHProvider client={posthog}>
      {/* `mode` is how we apply the custom colours to the MDX body */}
      <body className={cn(mode, "flex min-h-screen flex-col")}>{children}</body>
    </PHProvider>
  )
}
