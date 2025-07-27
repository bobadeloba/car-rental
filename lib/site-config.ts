import { getSiteUrl } from "./env-check"

/**
 * Centralized site configuration with fallbacks
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "YOLO Rental Cars",
  url: getSiteUrl(),
  ogImage: `${getSiteUrl()}/opengraph-image.png`,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Premium car rental service for all your needs",
  links: {
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/yolorentalcars",
    github: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/yolorentalcars",
  },
}
