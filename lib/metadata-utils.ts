import type { Metadata } from "next"
import { siteConfig } from "./site-config"

/**
 * Generate standard metadata for pages
 */
export function generateMetadata(
  title: string,
  description: string = siteConfig.description,
  image?: string,
): Metadata {
  const ogImage = image || `${siteConfig.url}/opengraph-image.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [{ url: ogImage }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}
