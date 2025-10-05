import { notFound } from "next/navigation"
import type { Metadata } from "next/types"

import { createRelativeLink } from "fumadocs-ui/mdx"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page"

import { AskAnLLM } from "@/components/ask-an-llm"
import { CopyMarkdown } from "@/components/copy-markdown"
import { OpenInGithub } from "@/components/open-in-github"
import { Rate } from "@/components/rate"
import { onRateAction, owner, repo } from "@/lib/github"
import { createMetadata } from "@/lib/metadata"
import { source } from "@/lib/source"
import { getMDXComponents } from "@/mdx-components"

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) {
    notFound()
  }

  const MDXContent = page.data.body
  const lastModified = page.data.lastModified
  const mdxUrl = `${page.url}.mdx`

  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-1">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pt-2 pb-6">
        <CopyMarkdown markdownUrl={mdxUrl} />
        <OpenInGithub
          githubUrl={`https://github.com/${owner}/${repo}/blob/main/apps/docs/content/docs/${page.path}`}
        />
        <AskAnLLM markdownUrl={mdxUrl} />
      </div>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
      <Rate date={lastModified} onRateAction={onRateAction} />
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return await source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) {
    notFound()
  }

  const metadata: Metadata = {
    title: page.data.title,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      url: page.url,
    },
  }
  if (page.data.description) {
    metadata.description = page.data.description
  }
  return createMetadata(metadata)
}
