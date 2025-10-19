import "@/app/global.css"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"

// import { Banner } from "fumadocs-ui/components/banner"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { RootProvider } from "fumadocs-ui/provider"
import type { Metadata } from "next"

import { Body } from "./layout.client"
import { baseOptions } from "./layout.config"

import { source } from "@/lib/source"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.cording.dev"),
  icons: {
    icon: "/favicon-x16.png",
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

  return (
    <html className={inter.className} lang="en" suppressHydrationWarning>
      <Body posthogKey={posthogKey}>
        <RootProvider>
          {/* <Banner
            rainbowColors={[
              "color-mix(in srgb, var(--color-fd-primary) 50%, transparent)",
              "color-mix(in srgb, var(--color-fd-primary) 50%, transparent)",
              "transparent",
              "color-mix(in srgb, var(--color-fd-primary) 50%, transparent)",
              "transparent",
              "color-mix(in srgb, var(--color-fd-primary) 50%, transparent)",
              "transparent",
            ]}
            variant="rainbow"
          >
            This project is currently a work in progress. It is forecast for
            formal release in September 2025.
          </Banner> */}
          <DocsLayout
            tree={source.pageTree}
            {...baseOptions}
            githubUrl="https://www.github.com/cording12/next-cloudflare-turbo"
            sidebar={{
              tabs: {
                transform(option, node) {
                  const meta = source.getNodeMeta(node)
                  if (!(meta && node.icon)) {
                    return option
                  }

                  // Custom colour for the sidebar navigation
                  const color = `var(--${meta.path.split("/")[0]}-color, var(--color-fd-foreground))`

                  return {
                    ...option,
                    icon: (
                      <div
                        className="size-full rounded-lg text-(--tab-color) max-md:border max-md:bg-(--tab-color)/10 max-md:p-1.5 [&_svg]:size-full"
                        style={
                          {
                            "--tab-color": color,
                          } as object
                        }
                      >
                        {node.icon}
                      </div>
                    ),
                  }
                },
              },
            }}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </Body>
    </html>
  )
}
