import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Config to go here
}

export default nextConfig

// enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

initOpenNextCloudflareForDev()
