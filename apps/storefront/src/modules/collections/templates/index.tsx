import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="content-container py-10">
      {/* Header */}
      <div
        className="reveal flex items-center gap-4 mb-8"
        style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: "1.5rem" }}
      >
        <div style={{ width: "32px", height: "1px", background: "var(--gold-border)" }} aria-hidden="true" />
        <h1
          className="font-display font-light italic uppercase"
          style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
        >
          {collection.title}
        </h1>
        <div className="flex-1" />
        <RefinementList sortBy={sort} />
      </div>

      <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length} />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          collectionId={collection.id}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}
