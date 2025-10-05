"use client"

/**
 * Full credit to fuma-name/fumadocs. This is a lightly modified version of page-actions.tsx
 * Original: https://github.com/fuma-nama/fumadocs/blob/5d8f8f2bd959a03e0e0b9dd64fe2ae95fcc225d6/apps/docs/components/ai/page-actions.tsx
 */

import { Link } from "fumadocs-core/framework"
import { buttonVariants } from "fumadocs-ui/components/ui/button"
import { ExternalLinkIcon } from "lucide-react"

import { captureButtonClick } from "@/lib/analytics"
import { cn } from "@/lib/cn"

export function OpenInGithub({ githubUrl }: { githubUrl: string }) {
  return (
    <Link
      className={cn(
        buttonVariants({
          color: "secondary",
          size: "sm",
          className: "gap-2 [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground",
        })
      )}
      href={githubUrl}
      onClick={() => {
        captureButtonClick("open", {
          button_name: "Open in Github",
          href: githubUrl,
        })
      }}
      rel="noreferrer noopener"
      target="_blank"
    >
      Open in Github
      <ExternalLinkIcon className="ms-auto size-3.5 text-fd-muted-foreground" />
    </Link>
  )
}
