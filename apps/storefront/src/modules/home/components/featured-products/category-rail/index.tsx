import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  categoryId: string
  categoryHandle: string
  titleAr: string
  region: HttpTypes.StoreRegion
  countryCode: string
  limit?: number
}

export default async function CategoryRail({
  categoryId,
  categoryHandle,
  titleAr,
  region,
  countryCode,
  limit = 8,
}: Props) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      category_id: [categoryId],
      fields: "*variants.calculated_price",
      limit,
    },
  })

  if (!products || products.length < 2) return null

  return (
    <div className="content-container py-12 small:py-20">
      <div className="reveal flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            style={{ width: "32px", height: "1px", background: "var(--gold-border)" }}
          />
          <h2
            className="font-display font-light italic uppercase"
            style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
          >
            {titleAr}
          </h2>
        </div>
        <LocalizedClientLink
          href={`/categories/${categoryHandle}`}
          className="font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-200"
          style={{ color: "var(--gold-dark)", letterSpacing: "0.2em" }}
        >
          عرض الكل →
        </LocalizedClientLink>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 large:grid-cols-4 gap-4 small:gap-6">
        {products.map((product) => (
          <li key={product.id} className="reveal">
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
