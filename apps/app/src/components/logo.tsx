import type { LucideProps } from "lucide-react"

import { cn } from "@/lib/utils" // Optional: for className merging

type LogoProps = LucideProps

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      aria-label="Logo"
      className={cn(className)}
      viewBox="0 0 82.28 65.15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Next Cloudflare Turbo logo</title>
      <path
        d="M10.22,48.47A27,27,0,1,1,55.47,21.81h6.92a17.39,17.39,0,0,1,9.66,31.85"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path
        d="M58.93,63.35,29.64,27a1.1,1.1,0,0,0-.86-.41H22.14a1.1,1.1,0,0,0-1.1,1.1V64a1.1,1.1,0,0,0,1.1,1.1h4.41A1.11,1.11,0,0,0,27.66,64V37.94a1.1,1.1,0,0,1,2-.69L51.73,64.73a1.1,1.1,0,0,0,.86.42h5.48A1.11,1.11,0,0,0,58.93,63.35Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}
