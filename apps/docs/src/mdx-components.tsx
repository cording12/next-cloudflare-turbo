import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"
import { ImageZoom } from "fumadocs-ui/components/image-zoom"
// biome-ignore lint: style/noNamespaceImport This is fine
import * as TabsComponents from "fumadocs-ui/components/tabs"
import defaultMdxComponents from "fumadocs-ui/mdx"
import {
  Album,
  AppWindow,
  BadgeQuestionMark,
  Building,
  Check,
  ChevronDown,
  Cloud,
  Copy,
  ExternalLinkIcon,
  Github,
  Layers,
  Lightbulb,
  MessageCircleIcon,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"
import type { MDXComponents } from "mdx/types"

import { Wrapper } from "@/components/wrapper"

export const iconMap = {
  Album,
  BadgeQuestionMark,
  Cloud,
  Building,
  AppWindow,
  Github,
  Check,
  Copy,
  ChevronDown,
  ExternalLinkIcon,
  Layers,
  Lightbulb,
  MessageCircleIcon,
  ThumbsUp,
  ThumbsDown,
}

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...iconMap,
    ...defaultMdxComponents,
    ...components,
    ...TabsComponents,
    Wrapper,
    // biome-ignore lint: suspcious/noExplicitAny - This is fine
    img: (props) => <ImageZoom {...(props as any)} />,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
  }
}
