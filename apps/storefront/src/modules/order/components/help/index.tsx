import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Help = () => {
  return (
    <div className="mt-6">
      <p
        className="font-sans text-xs uppercase tracking-[0.15em] mb-3"
        style={{ color: "var(--gold-dark)" }}
      >
        هل تحتاج مساعدة؟
      </p>
      <ul className="flex flex-col gap-2">
        <li>
          <LocalizedClientLink
            href="/content/contact"
            className="font-sans text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--ivory-dim)" }}
          >
            تواصل معنا
          </LocalizedClientLink>
        </li>
        <li>
          <LocalizedClientLink
            href="/content/shipping-policy"
            className="font-sans text-sm hover:opacity-80 transition-opacity"
            style={{ color: "var(--ivory-dim)" }}
          >
            الشحن والاستبدال والإرجاع
          </LocalizedClientLink>
        </li>
      </ul>
    </div>
  )
}

export default Help
