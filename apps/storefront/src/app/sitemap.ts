import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { getBaseURL } from "@lib/util/env"

const BASE = getBaseURL()
const COUNTRY = "eg"

const CONTENT_SLUGS = [
  "about",
  "contact",
  "privacy-policy",
  "terms-of-use",
  "shipping-policy",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages
  entries.push(
    { url: `${BASE}/${COUNTRY}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/${COUNTRY}/store`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  )

  // Content pages
  CONTENT_SLUGS.forEach((slug) => {
    entries.push({
      url: `${BASE}/${COUNTRY}/content/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    })
  })

  // Products
  try {
    const { response } = await listProducts({
      pageParam: 1,
      queryParams: { limit: 250 },
      countryCode: COUNTRY,
    })
    response.products.forEach((p) => {
      if (p.handle) {
        entries.push({
          url: `${BASE}/${COUNTRY}/products/${p.handle}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
    })
  } catch {
    // If products fetch fails, sitemap still serves static pages
  }

  // Categories
  try {
    const categories = await listCategories()
    categories?.forEach((c) => {
      if (c.handle) {
        entries.push({
          url: `${BASE}/${COUNTRY}/categories/${c.handle}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        })
      }
    })
  } catch {
    // If categories fetch fails, sitemap still serves static pages
  }

  return entries
}
