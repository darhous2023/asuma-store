import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents: HttpTypes.StoreProductCategory[] = []
  const getParents = (cat: HttpTypes.StoreProductCategory) => {
    if (cat.parent_category) {
      parents.push(cat.parent_category)
      getParents(cat.parent_category)
    }
  }
  getParents(category)

  return (
    <div className="content-container py-10" data-testid="category-container">
      {/* Header */}
      <div
        className="reveal flex items-center gap-4 mb-8"
        style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: "1.5rem" }}
      >
        <div style={{ width: "32px", height: "1px", background: "var(--gold-border)" }} aria-hidden="true" />
        <div className="flex items-center gap-2">
          {parents.reverse().map((parent) => (
            <span key={parent.id} className="flex items-center gap-2">
              <LocalizedClientLink
                href={`/categories/${parent.handle}`}
                className="font-sans text-sm uppercase tracking-[0.15em] transition-colors duration-200"
                style={{ color: "var(--ivory-muted)", letterSpacing: "0.15em" }}
              >
                {parent.name}
              </LocalizedClientLink>
              <span style={{ color: "var(--gold-border)" }}>/</span>
            </span>
          ))}
          <h1
            className="font-display font-light italic uppercase"
            style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
            data-testid="category-page-title"
          >
            {category.name}
          </h1>
        </div>
        <div className="flex-1" />
        <RefinementList sortBy={sort} />
      </div>

      {/* Description */}
      {category.description && (
        <p className="font-sans text-sm mb-8" style={{ color: "var(--ivory-muted)", maxWidth: "600px" }}>
          {category.description}
        </p>
      )}

      {/* Sub-categories */}
      {category.category_children && category.category_children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {category.category_children.map((c) => (
            <LocalizedClientLink
              key={c.id}
              href={`/categories/${c.handle}`}
              className="font-sans text-xs uppercase tracking-[0.15em] px-4 py-2 transition-all duration-200"
              style={{
                border: "1px solid var(--gold-border)",
                color: "var(--ivory-muted)",
                letterSpacing: "0.15em",
              }}
            >
              {c.name}
            </LocalizedClientLink>
          ))}
        </div>
      )}

      <Suspense fallback={<SkeletonProductGrid numberOfProducts={category.products?.length ?? 8} />}>
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          categoryId={category.id}
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}
