import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-20 px-6 flex flex-col justify-center items-center text-center"
      data-testid="empty-cart-message"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "var(--gold-border)", marginBottom: "1.5rem" }}
        aria-hidden="true"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      <h2
        className="font-display font-light italic uppercase mb-4"
        style={{ color: "var(--ivory)", letterSpacing: "0.15em", fontSize: "1.5rem" }}
      >
        سلة التسوق فارغة
      </h2>
      <p
        className="font-sans text-sm mb-8"
        style={{ color: "var(--ivory-muted)", maxWidth: "28rem", lineHeight: "1.75" }}
      >
        لم تضيفي أي منتج بعد. تصفّحي مجموعتنا واختاري ما يعجبك.
      </p>
      <LocalizedClientLink
        href="/store"
        className="font-sans text-xs uppercase tracking-[0.2em] px-8 py-3 transition-all duration-200"
        style={{
          border: "1px solid var(--gold)",
          color: "var(--gold)",
          letterSpacing: "0.2em",
        }}
      >
        تسوّقي الآن
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
