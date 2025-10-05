import type { MetadataRoute } from "next"

import { source } from "@/lib/source" // Your Fumadocs source

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://docs.cording.dev"

  const pages = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
    },
    ...pages,
  ]
}
