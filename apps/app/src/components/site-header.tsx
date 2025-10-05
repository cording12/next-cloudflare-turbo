import Link from "next/link"

import { ExternalLink, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mx-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <h1 className="font-medium text-base">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild className="hidden sm:flex" variant="default">
            <Link
              href="https://docs.cording.dev/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Read the documentation
              <span>
                <ExternalLink />
              </span>
            </Link>
          </Button>
          <Button
            asChild
            className="hidden sm:flex"
            size="icon"
            variant="outline"
          >
            <Link
              href="https://github.com/cording12/next-cloudflare-turbo"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
