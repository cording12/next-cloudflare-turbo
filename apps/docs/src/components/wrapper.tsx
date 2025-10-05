import type { HTMLAttributes } from "react"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/cn"

const innerWrapperVariants = cva("flex flex-col", {
  variants: {
    alignment: {
      centre: "items-center justify-center",
    },
    background: {
      default:
        "bg-radial-[at_bottom] from-[var(--color-fd-primary)]/5 to-[var(--color-fd-background)]",
      none: "bg-none bg-transparent",
      solid: "bg-[var(--color-fd-background)]",
    },
  },
  defaultVariants: {
    background: "default",
  },
})

interface WrapperProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof innerWrapperVariants> {
  caption?: string
}

export function Wrapper({
  className,
  alignment,
  background = "default",
  caption,
  children,
  ...props
}: WrapperProps): React.ReactElement {
  return (
    <div
      className={cn(
        "not-prose rounded-lg bg-radial-[at_top] from-[var(--color-fd-primary)]/30 via-[var(--color-fd-foreground)]/10 to-[var(--color-fd-primary)]/30 p-[1px] [&_*]:rounded-lg",
        className
      )}
      {...props}
    >
      <div className={cn(innerWrapperVariants({ alignment, background }))}>
        <div className="rounded-lg p-4">{children}</div>
        {caption && (
          <div className="!rounded-t-none w-full bg-fd-background/40 px-4 py-2 text-center text-muted-foreground text-sm">
            {caption}
          </div>
        )}
      </div>
    </div>
  )
}
