import { createMDX } from "fumadocs-mdx/next"
import type { NextConfig } from "next"

const withMDX = createMDX()

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.cording.dev",
      },
    ],
  },
  // biome-ignore lint/suspicious/useAwait: Rewrites must be async
  async rewrites() {
    return [
      {
        source: "/:path*.mdx",
        destination: "/api/fetch-mdx/:path*",
      },
      {
        source: "/nct/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/nct/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ]
  },
}

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

//Don't include analyzer in production
export default process.env.ANALYZE === "true"
  ? withBundleAnalyzer(withMDX(nextConfig))
  : withMDX(nextConfig)

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev()
