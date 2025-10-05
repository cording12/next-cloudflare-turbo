import { createElement } from "react"

import type { InferMetaType, InferPageType } from "fumadocs-core/source"
import { loader } from "fumadocs-core/source"

import { docs } from "@/.source"
// import { icons } from "lucide-react"
import { iconMap } from "@/mdx-components"

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) {
      return
    }

    if (icon in iconMap) {
      return createElement(iconMap[icon as keyof typeof iconMap])
    }
  },
})

export type Page = InferPageType<typeof source>
export type Meta = InferMetaType<typeof source>
