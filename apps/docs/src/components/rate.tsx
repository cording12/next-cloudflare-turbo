"use client"
import { type SyntheticEvent, useEffect, useState, useTransition } from "react"
import { usePathname } from "next/navigation"

import { cva } from "class-variance-authority"
import { buttonVariants } from "fumadocs-ui/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
} from "fumadocs-ui/components/ui/collapsible"
import { PageLastUpdate } from "fumadocs-ui/layouts/docs/page-client"
import { ThumbsDown, ThumbsUp } from "lucide-react"

/**
 * Full credit to fuma-name/fumadocs. This is a lightly modified version of page-actions.tsx
 * Original: https://github.com/fuma-nama/fumadocs/blob/5d8f8f2bd959a03e0e0b9dd64fe2ae95fcc225d6/apps/docs/components/rate.tsx
 */
import { cn } from "@/lib/cn"

const rateButtonVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-3 py-2 font-medium text-sm disabled:cursor-not-allowed [&_svg]:size-4",
  {
    variants: {
      active: {
        true: "bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current",
        false: "text-fd-muted-foreground",
      },
    },
  }
)

export interface Feedback {
  opinion: "good" | "bad"
  url?: string
  message: string
}

export interface ActionResponse {
  githubUrl: string
}

interface Result extends Feedback {
  response?: ActionResponse
}

export function Rate({
  onRateAction,
  date,
}: {
  onRateAction: (url: string, feedback: Feedback) => Promise<ActionResponse>
  date?: Date
}) {
  const url = usePathname()
  const [previous, setPrevious] = useState<Result | null>(null)
  const [opinion, setOpinion] = useState<"good" | "bad" | null>(null)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const item = localStorage.getItem(`docs-feedback-${url}`)

    if (item === null) {
      return
    }
    setPrevious(JSON.parse(item) as Result)
  }, [url])

  useEffect(() => {
    const key = `docs-feedback-${url}`

    if (previous) {
      localStorage.setItem(key, JSON.stringify(previous))
    } else {
      localStorage.removeItem(key)
    }
  }, [previous, url])

  function submit(e?: SyntheticEvent) {
    async function handleRate() {
      if (opinion == null) {
        return
      }

      const feedback: Feedback = {
        opinion,
        message,
      }

      const response = await onRateAction(url, feedback)
      setPrevious({
        response,
        ...feedback,
      })
      setMessage("")
      setOpinion(null)
    }

    startTransition(() => {
      handleRate()
    })

    e?.preventDefault()
  }

  const activeOpinion = previous?.opinion ?? opinion

  return (
    <Collapsible
      className="mt-6 border-y py-3"
      onOpenChange={(v) => {
        if (!v) {
          setOpinion(null)
        }
      }}
      open={opinion !== null || previous !== null}
    >
      <div className="flex flex-col items-baseline justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-row items-center gap-2">
          <p className="pe-2 font-medium text-sm">How is this guide?</p>
          <button
            className={cn(
              "cursor-pointer",
              rateButtonVariants({
                active: activeOpinion === "good",
              })
            )}
            disabled={previous !== null}
            onClick={() => {
              setOpinion("good")
            }}
            type="button"
          >
            <ThumbsUp />
            Good
          </button>
          <button
            className={cn(
              "cursor-pointer",
              rateButtonVariants({
                active: activeOpinion === "bad",
              })
            )}
            disabled={previous !== null}
            onClick={() => {
              setOpinion("bad")
            }}
            type="button"
          >
            <ThumbsDown />
            Bad
          </button>
        </div>
        <div>{date && <PageLastUpdate date={date} />}</div>
      </div>
      <CollapsibleContent className="mt-3">
        {previous ? (
          <div className="flex flex-col items-center gap-3 rounded-xl bg-fd-card px-3 py-6 text-center text-fd-muted-foreground text-sm">
            <p>Thank you for your feedback!</p>
            <div className="flex flex-row items-center gap-2">
              <a
                className={cn(
                  buttonVariants({
                    color: "primary",
                  }),
                  "text-xs"
                )}
                href={
                  "https://github.com/cording12/next-cloudflare-turbo/discussions"
                }
                rel="noreferrer noopener"
                target="_blank"
              >
                View on GitHub
              </a>

              <button
                className={cn(
                  buttonVariants({
                    color: "secondary",
                  }),
                  "text-xs"
                )}
                onClick={() => {
                  setOpinion(previous.opinion)
                  setPrevious(null)
                }}
                type="button"
              >
                Submit Again
              </button>
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <textarea
              autoFocus
              className="resize-none rounded-lg border bg-fd-secondary p-3 text-fd-secondary-foreground placeholder:text-fd-muted-foreground focus-visible:outline-none"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (!e.shiftKey && e.key === "Enter") {
                  submit(e)
                }
              }}
              placeholder="Leave your feedback..."
              required
              value={message}
            />
            <button
              className={cn(
                buttonVariants({ color: "outline" }),
                "w-fit cursor-pointer px-3"
              )}
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
