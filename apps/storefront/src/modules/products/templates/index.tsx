import React, { Suspense } from "react"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) return notFound()

  return (
    <div style={{ backgroundColor: "var(--obsidian)" }}>
      {/* Breadcrumb */}
      <div className="content-container pt-6 pb-0">
        <p className="font-sans text-xs uppercase tracking-[0.2em]" style={{ color: "var(--ivory-muted)" }}>
          <a href="../store" style={{ color: "var(--gold-dark)" }}>المتجر</a>
          {product.collection && (
            <>
              <span className="mx-2" style={{ color: "var(--gold-border)" }}>/</span>
              <a href={`../collections/${product.collection.handle}`} style={{ color: "var(--gold-dark)" }}>
                {product.collection.title}
              </a>
            </>
          )}
          <span className="mx-2" style={{ color: "var(--gold-border)" }}>/</span>
          <span style={{ color: "var(--ivory-muted)" }}>{product.title}</span>
        </p>
      </div>

      {/* Main product layout */}
      <div
        className="content-container flex flex-col small:flex-row gap-8 py-8"
        data-testid="product-container"
      >
        {/* Gallery — center/left */}
        <div className="w-full small:w-[55%]">
          <ImageGallery images={images} />
        </div>

        {/* Info + Actions — right sticky */}
        <div className="w-full small:w-[45%] flex flex-col gap-6 small:sticky small:top-24 small:self-start">
          <ProductInfo product={product} />

          <div
            aria-hidden="true"
            style={{ height: "1px", background: "linear-gradient(90deg, var(--gold-border), transparent)" }}
          />

          <Suspense fallback={<ProductActions disabled product={product} region={region} />}>
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          <ProductTabs product={product} />
        </div>
      </div>

      {/* Divider */}
      <div className="content-container">
        <div
          aria-hidden="true"
          style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)", margin: "2rem 0" }}
        />
      </div>

      {/* Related Products */}
      <div className="content-container pb-16" data-testid="related-products-container">
        <div className="flex items-center gap-4 mb-8">
          <div style={{ width: "32px", height: "1px", background: "var(--gold-border)" }} aria-hidden="true" />
          <h2
            className="font-display font-light italic uppercase"
            style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "1.3rem" }}
          >
            منتجات مشابهة
          </h2>
        </div>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
