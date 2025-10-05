import { notFound } from "next/navigation"
import { type NextRequest, NextResponse } from "next/server"

import { getMdx } from "@/lib/get-mdx"
import { source } from "@/lib/source"

export const revalidate = false

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = (await params).slug
  const page = source.getPage(slug)
  if (!page) {
    notFound()
  }

  return new NextResponse(await getMdx(page))
}

// This statically generates all the MDX routes for the "copy" button
// If your GitHub repo is private, this will fail the build. Comment it out/delete to fix.
export function generateStaticParams() {
  return source.generateParams()
}
