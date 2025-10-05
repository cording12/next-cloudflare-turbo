import type { Metadata } from "next/types"

export const baseUrl = new URL("https://docs.cording.dev")
const DEFAULT_TITLE = "Next-Cloudflare-Turbo"
const TITLE_TEMPLATE = "%s | Next-Cloudflare-Turbo"
const DEFAULT_DESCRIPTION =
  "Next-Cloudflare-Turbo is a production-ready Next.js and Cloudflare Workers monorepo template. Ship full-stack apps on the edge with OpenNext, Wrangler, D1, R2, and Cloudflare Agents in a single Turborepo."
const DEFAULT_KEYWORDS = [
  "Next.js",
  "Cloudflare Workers",
  "Turborepo",
  "OpenNext",
  "Wrangler",
  "D1",
  "R2",
  "KV",
  "LLM",
  "Cloudflare Agents",
  "edge computing",
  "serverless",
  "template",
  "monorepo",
]

export function createMetadata(override: Metadata): Metadata {
  const title = (() => {
    if (!override.title) {
      return DEFAULT_TITLE
    }

    if (typeof override.title === "string") {
      return `${override.title} | Next-Cloudflare-Turbo`
    }

    // biome-ignore lint/suspicious/noExplicitAny: This is fine
    return (override.title as any).default || DEFAULT_TITLE
  })()

  const description = override.description ?? DEFAULT_DESCRIPTION

  return {
    ...override,
    metadataBase: baseUrl,
    title: { default: title, template: TITLE_TEMPLATE },
    description,
    applicationName: "Next-Cloudflare-Turbo",
    category: "Technology",
    keywords: override.keywords
      ? [...DEFAULT_KEYWORDS, ...override.keywords]
      : DEFAULT_KEYWORDS,
    authors: [{ name: "Jon Cording", url: "https://docs.cording.dev" }],
    creator: "cording.dev",
    publisher: "cording.dev",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      title,
      description,
      url: "https://docs.cording.dev",
      images: "https://assets.cording.dev/banner.png",
      siteName: "Next-Cloudflare-Turbo",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@CordingDev",
      title,
      description,
      images: "https://assets.cording.dev/banner.png",
      ...override.twitter,
    },
  }
}
