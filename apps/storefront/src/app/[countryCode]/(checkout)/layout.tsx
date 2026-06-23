import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import AsumaLogo from "@modules/common/components/asuma-logo"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="w-full relative small:min-h-screen"
      style={{ backgroundColor: "var(--obsidian)" }}
    >
      {/* Checkout nav */}
      <div
        className="h-16"
        style={{
          backgroundColor: "var(--obsidian)",
          borderBottom: "1px solid var(--gold-border)",
        }}
      >
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-x-2 uppercase flex-1 basis-0 text-sm transition-colors duration-200"
            style={{ color: "var(--ivory-dim)" }}
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block">Back to cart</span>
            <span className="mt-px block small:hidden">Back</span>
          </LocalizedClientLink>

          <LocalizedClientLink href="/" data-testid="store-link">
            <AsumaLogo size={28} showText={true} />
          </LocalizedClientLink>

          <div className="flex-1 basis-0" />
        </nav>
      </div>

      <div className="relative" data-testid="checkout-container">
        {children}
      </div>

      {/* Minimal checkout footer */}
      <div
        className="py-6 w-full flex items-center justify-center"
        style={{ borderTop: "1px solid var(--gold-border)" }}
      >
        <p className="font-sans text-xs" style={{ color: "var(--ivory-muted)" }}>
          © {new Date().getFullYear()} Asuma Store &nbsp;·&nbsp; Designed &amp; Developed by{" "}
          <a
            href="mailto:ahmeddarhous@gmail.com"
            className="transition-colors duration-200"
            style={{ color: "var(--gold-dark)" }}
          >
            Ahmed Darhous
          </a>
        </p>
      </div>
    </div>
  )
}
