import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import QuickAddButton from "./QuickAddButton"

export default async function ProductPreview({
  product,
  isFeatured,
  countryCode = "eg",
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region?: HttpTypes.StoreRegion
  countryCode?: string
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const image = product.thumbnail ?? product.images?.[0]?.url

  // Show quick-add only for single-variant (no choices needed)
  const singleVariant =
    (product.variants?.length ?? 0) === 1 &&
    (product.options?.length ?? 0) <= 1
  const variantId = product.variants?.[0]?.id

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
      style={{ touchAction: "manipulation" }}
    >
      <div
        data-testid="product-wrapper"
        className="relative overflow-hidden group-hover:[border-color:var(--gold)] group-hover:-translate-y-0.5"
        style={{
          backgroundColor: "var(--carbon, #0D0D0D)",
          border: "1px solid var(--gold-border, rgba(201,169,110,0.15))",
          transition: "border-color 0.3s ease, transform 0.3s ease",
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={70}
              draggable={false}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: "var(--obsidian, #060606)" }}
            >
              <PlaceholderImage size={isFeatured ? 24 : 16} />
            </div>
          )}

          {/* Hover overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 product-hover-overlay"
            style={{ background: "linear-gradient(to top, rgba(6,6,6,0.75) 0%, transparent 60%)" }}
          >
            <span
              className="font-sans text-xs uppercase tracking-[0.25em]"
              style={{ color: "var(--gold, #C9A96E)" }}
            >
              عرض المنتج
            </span>
          </div>

          {/* Quick-add button */}
          {singleVariant && variantId && (
            <QuickAddButton variantId={variantId} countryCode={countryCode} />
          )}
        </div>

        {/* Info */}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <p
            className="font-display font-light truncate flex-1 text-sm"
            style={{ color: "var(--ivory-dim, #C8BFB0)", letterSpacing: "0.03em" }}
            data-testid="product-title"
          >
            {product.title}
          </p>

          {cheapestPrice && (
            <div className="shrink-0 flex items-center gap-1.5">
              {cheapestPrice.price_type === "sale" && (
                <span
                  className="font-sans text-xs line-through"
                  style={{ color: "var(--ivory-muted, #7A6A5A)" }}
                >
                  {cheapestPrice.original_price}
                </span>
              )}
              <span
                className="font-sans text-sm font-medium"
                style={{
                  color:
                    cheapestPrice.price_type === "sale"
                      ? "var(--gold-bright, #E5C882)"
                      : "var(--gold, #C9A96E)",
                  letterSpacing: "0.04em",
                }}
                data-testid="price"
              >
                {cheapestPrice.calculated_price}
              </span>
            </div>
          )}
        </div>

        {/* Bottom gold line — appears on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
        />
      </div>
    </LocalizedClientLink>
  )
}
