/**
 * Full credit to fuma-name/fumadocs. This is a lightly modified version of page-actions.tsx
 * Original: https://github.com/fuma-nama/fumadocs/blob/5d8f8f2bd959a03e0e0b9dd64fe2ae95fcc225d6/apps/docs/lib/github.ts
 */
import { App, type Octokit } from "octokit"

import type { ActionResponse, Feedback } from "@/components/rate"

export const repo = "next-cloudflare-turbo"
export const owner = "cording12"
export const DocsCategory = "Docs Feedback"

let instance: Octokit | undefined

async function getOctokit(): Promise<Octokit> {
  if (instance) {
    return instance
  }

  const appId = Number(process.env.GITHUB_APP_ID)

  if (Number.isNaN(appId)) {
    throw new Error(`GITHUB_APP_ID must be a number. Received: ${appId}`)
  }

  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY

  if (!(appId && privateKey)) {
    throw new Error(
      "No GitHub keys provided for Github app, docs feedback feature will not work."
    )
  }

  const app = new App({
    appId,
    privateKey,
  })

  const { data } = await app.octokit.request(
    "GET /repos/{owner}/{repo}/installation",
    {
      owner,
      repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  )

  instance = await app.getInstallationOctokit(data.id)
  return instance
}

interface RepositoryInfo {
  id: string
  discussionCategories: {
    nodes: {
      id: string
      name: string
    }[]
  }
}

let cachedDestination: RepositoryInfo | undefined
async function getFeedbackDestination() {
  if (cachedDestination) {
    return cachedDestination
  }
  const octokit = await getOctokit()

  const {
    repository,
  }: {
    repository: RepositoryInfo
  } = await octokit.graphql(`
  query {
    repository(owner: "${owner}", name: "${repo}") {
      id
      discussionCategories(first: 25) {
        nodes { id name }
      }
    }
  }
`)

  // biome-ignore lint/suspicious/noAssignInExpressions: It's fine
  return (cachedDestination = repository)
}

export async function onRateAction(
  url: string,
  feedback: Feedback
): Promise<ActionResponse> {
  "use server"

  const octokit = await getOctokit()
  const destination = await getFeedbackDestination()

  if (!(octokit && destination)) {
    throw new Error("GitHub comment integration is not configured.")
  }

  const docsCategory = destination.discussionCategories.nodes.find(
    (cat) => cat.name === DocsCategory
  )

  if (!docsCategory) {
    throw new Error(
      `Please create a "${DocsCategory}" category in GitHub Discussions.`
    )
  }

  const title = `Feedback for ${url}`
  const body = `[${feedback.opinion}] ${feedback.message}\n\n> Forwarded from user feedback.`
  const searchQuery = `${title} in:title repo:${owner}/${repo}`
  const searchResult = await octokit.graphql<{
    search: {
      nodes: Array<{ id: string; url: string } | { __typename: string }>
    }
  }>(
    `
      query ($q: String!) {
        search(type: DISCUSSION, query: $q, first: 1) {
          nodes {
            ... on Discussion { id url }
          }
        }
      }
    `,
    { q: searchQuery }
  )

  let discussion: { id: string; url: string } | undefined =
    // biome-ignore lint/suspicious/noExplicitAny: It's fine
    (searchResult.search.nodes[0] as any) ?? undefined

  if (discussion?.id) {
    await octokit.graphql(
      `
        mutation ($discussionId: ID!, $body: String!) {
          addDiscussionComment(input: { body: $body, discussionId: $discussionId }) {
            comment { id }
          }
        }
      `,
      { discussionId: discussion.id, body }
    )
  } else {
    const createResult = await octokit.graphql<{
      createDiscussion: {
        discussion: { id: string; url: string } | null
      } | null
    }>(
      `
        mutation ($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
          createDiscussion(
            input: {
              repositoryId: $repositoryId
              categoryId: $categoryId
              title: $title
              body: $body
            }
          ) {
            discussion { id url }
          }
        }
      `,
      {
        repositoryId: destination.id,
        categoryId: docsCategory.id,
        title,
        body,
      }
    )

    const created = createResult?.createDiscussion?.discussion
    if (!created) {
      throw new Error(
        "Failed to create discussion — check Discussions permissions on the GitHub App."
      )
    }
    discussion = created
  }

  if (!discussion?.url) {
    throw new Error(
      "Discussion URL missing — unexpected GraphQL response shape."
    )
  }

  return { githubUrl: discussion.url }
}
