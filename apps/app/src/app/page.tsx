import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
        <div className="w-full max-w-2xl space-y-3">
          <h2 className="mb-8 font-light text-2xl">
            Next-Cloudflare-Turbo is a production-ready template that shows you
            how to build modern full-stack applications using Cloudflare's edge
            infrastructure.
          </h2>
          <Button>
            <Link href="/dashboard">Visit Dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
