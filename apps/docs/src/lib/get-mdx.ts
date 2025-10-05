import { owner, repo } from "@/lib/github"
import type { Page } from "@/lib/source"

export async function getMdx(page: Page) {
  const githubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/main/apps/docs/content/docs/${page.path}`
  const response = await fetch(githubUrl)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch content: ${response.status} ${response.statusText}`
    )
  }

  const content = await response.text()

  const constructedResponse = [
    `URL: https://docs.cording.dev/${page.url}`,
    `Source: ${githubUrl}`,
    "",
    content,
  ].join("\n")

  return constructedResponse
}
