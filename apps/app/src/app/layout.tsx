import { Inter, Roboto_Mono } from "next/font/google"

import type { Metadata } from "next"

import { ThemeProvider } from "@/components/theme/theme-provider"
import { cn } from "@/lib/utils"
import "./globals.css"

import { Toaster } from "@/components/ui/sonner"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Next Cloudflare Turbo",
  description:
    "A template repository for Next.js & Cloudflare in a Turbo monorepo",
  icons: {
    icon: [{ url: "/favicon-x16.png", sizes: "16x16", type: "image/png" }],
  },
}

export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
