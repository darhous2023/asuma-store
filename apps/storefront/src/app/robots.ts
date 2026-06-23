import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL()

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/cart",
        "/*/checkout",
        "/*/account",
        "/*/order",
        "/*/verify-account",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
