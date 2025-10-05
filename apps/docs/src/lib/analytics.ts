import posthog from "posthog-js"

interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | null | undefined
}

interface ButtonClickProperties extends AnalyticsEventProperties {
  button_name: string
}

export function getSectionAndPage(pathname: string) {
  const [section, page] = pathname.replace(/^\/|\/$/g, "").split("/")
  return { section, page }
}

export function captureEvent<
  T extends AnalyticsEventProperties = AnalyticsEventProperties,
>(event: string, properties: T = {} as T) {
  if (typeof window === "undefined") {
    return
  }
  posthog.capture(event, { ...properties })
}

export function captureButtonClick(
  event: string,
  properties: ButtonClickProperties
) {
  posthog.capture(event, { ...properties })
}
