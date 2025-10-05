"use client"
/**
 * Full credit to fuma-name/fumadocs. This is a lightly modified version of page-actions.tsx
 * Original: https://github.com/fuma-nama/fumadocs/blob/5d8f8f2bd959a03e0e0b9dd64fe2ae95fcc225d6/apps/docs/components/ai/page-actions.tsx
 */

import { useState } from "react"

import { buttonVariants } from "fumadocs-ui/components/ui/button"
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button"
import { Check, Copy } from "lucide-react"

import { captureButtonClick } from "@/lib/analytics"
import { cn } from "@/lib/cn"

const cache = new Map<string, string>()

export function CopyMarkdown({
  /**
   * A URL to fetch the raw Markdown/MDX content of page
   */
  markdownUrl,
}: {
  markdownUrl: string
}) {
  const [isLoading, setLoading] = useState(false)
  const [checked, onClick] = useCopyButton(async () => {
    let content = cache.get(markdownUrl)
    setLoading(true)
    try {
      if (!content) {
        const res = await fetch(markdownUrl)
        content = await res.text()
        cache.set(markdownUrl, content)
      }
      await navigator.clipboard.writeText(content)
    } finally {
      captureButtonClick("copy_markdown", {
        button_name: "Copy Markdown",
      })
      setLoading(false)
    }
  })

  return (
    <button
      className={cn(
        "cursor-copy",
        buttonVariants({
          color: "secondary",
          size: "sm",
          className: "gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
        })
      )}
      disabled={isLoading}
      onClick={onClick}
      type="button"
    >
      {checked ? <Check /> : <Copy />}
      Copy Markdown
    </button>
  )
}
