import type { MetadataRoute } from "next"

import { source } from "@/lib/source" // Your Fumadocs source

// Helper: ensure a trailing slash to match canonicals
const withTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`)

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://docs.cording.dev"

  const pages = source.getPages().map((page) => ({
    url: withTrailingSlash(`${baseUrl}${page.url}`),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // De-duplicate in case of accidental duplicates from your source
  const unique = new Map<string, MetadataRoute.Sitemap[number]>()
  for (const entry of pages) {
    unique.set(entry.url, entry)
  }

  return Array.from(unique.values())
}
