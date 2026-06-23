import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ProductInfo = ({ product }: { product: HttpTypes.StoreProduct }) => {
  return (
    <div id="product-info" className="flex flex-col gap-4">
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="font-sans text-xs uppercase tracking-[0.2em] transition-colors duration-200"
          style={{ color: "var(--gold-dark)", letterSpacing: "0.2em" }}
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}

      <h2
        className="font-display font-light"
        style={{
          color: "var(--ivory)",
          fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
          lineHeight: 1.2,
          letterSpacing: "0.02em",
        }}
        data-testid="product-title"
      >
        {product.title}
      </h2>

      {product.description && (
        <p
          className="font-sans text-sm leading-relaxed"
          style={{ color: "var(--ivory-muted)", letterSpacing: "0.03em" }}
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}
    </div>
  )
}

export default ProductInfo
