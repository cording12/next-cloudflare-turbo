import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache"

// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"
// import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue"
// import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache"

/**
 * Standard Cloudflare config.
 * Uses a read-only Workers Static Assets-based incremental cache for the prerendered routes
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
})

/**
 * Cloudflare config implementing caching
 * See: https://opennext.js.org/cloudflare/caching
 */
// export default defineCloudflareConfig({
// // Incremental cache using R2
// incrementalCache: r2IncrementalCache,
// queue: doQueue,

// // This is used for on-demand revalidation, i.e. revalidatePath/revalidateTag
// tagCache: d1NextTagCache,

// // Disable this if you want to use PPR
// // See: https://nextjs.org/docs/app/getting-started/partial-prerendering
// enableCacheInterception: true,
// })
