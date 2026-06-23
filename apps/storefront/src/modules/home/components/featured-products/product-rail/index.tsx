import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-20">
      {/* Collection header */}
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
            {collection.title}
          </h2>
        </div>
        <a
          href={`/collections/${collection.handle}`}
          className="font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-200"
          style={{ color: "var(--gold-dark)", letterSpacing: "0.2em" }}
        >
          عرض الكل →
        </a>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 large:grid-cols-4 gap-4 small:gap-6">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id} className="reveal">
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
