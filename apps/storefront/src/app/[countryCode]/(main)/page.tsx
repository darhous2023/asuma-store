import { Metadata } from "next"
import { Suspense } from "react"

import Hero from "@modules/home/components/hero"
import CategoryRail from "@modules/home/components/featured-products/category-rail"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import { HOME_CATEGORY_RAILS, CATEGORY_HANDLES } from "@config/storefront"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "أسومة ستور | Asuma Store",
  description:
    "إكسسوارات · شعر · مكياج · عطور · هدايا فاخرة — القاهرة، مصر | Luxury beauty & accessories, Cairo Egypt.",
  openGraph: {
    title: "أسومة ستور | Asuma Store",
    description: "إكسسوارات · شعر · مكياج · عطور · هدايا فاخرة — القاهرة، مصر",
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "أسومة ستور | Asuma Store",
    description: "إكسسوارات · شعر · مكياج · عطور · هدايا فاخرة — القاهرة، مصر",
  },
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  if (!region) return null

  const allCategories = await listCategories()
  const categoryMap = new Map(
    (allCategories ?? []).map((c) => [c.handle, c])
  )

  type Rail = (typeof HOME_CATEGORY_RAILS)[number] & {
    category: NonNullable<ReturnType<typeof categoryMap.get>>
  }

  const rails = HOME_CATEGORY_RAILS.reduce<Rail[]>((acc, rail) => {
    const cat = categoryMap.get(CATEGORY_HANDLES[rail.handle])
    if (cat) acc.push({ ...rail, category: cat })
    return acc
  }, [])

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          {rails.map((rail) => (
            <li key={rail.category.id}>
              <Suspense fallback={<div className="content-container py-12"><SkeletonProductGrid numberOfProducts={4} /></div>}>
                <CategoryRail
                  categoryId={rail.category.id}
                  categoryHandle={rail.category.handle ?? rail.handle}
                  titleAr={rail.titleAr}
                  region={region}
                  countryCode={countryCode}
                  limit={rail.limit}
                />
              </Suspense>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
