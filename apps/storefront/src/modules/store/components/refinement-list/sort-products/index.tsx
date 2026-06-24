"use client"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions: { value: SortOptions; labelAr: string; labelEn: string }[] = [
  { value: "created_at", labelAr: "الأحدث", labelEn: "Latest" },
  { value: "price_asc",  labelAr: "السعر: الأقل أولاً", labelEn: "Price: Low → High" },
  { value: "price_desc", labelAr: "السعر: الأعلى أولاً", labelEn: "Price: High → Low" },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  return (
    <div className="flex items-center gap-2 shrink-0" data-testid={dataTestId}>
      <span
        className="font-sans text-xs uppercase tracking-[0.14em]"
        style={{ color: "var(--ivory-muted)", whiteSpace: "nowrap" }}
      >
        ترتيب
      </span>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setQueryParams("sortBy", e.target.value as SortOptions)}
          className="appearance-none font-sans text-xs uppercase tracking-[0.12em] pr-6 pl-3 py-1.5 bg-transparent cursor-pointer outline-none"
          style={{
            border: "1px solid var(--gold-border)",
            color: "var(--gold)",
            letterSpacing: "0.1em",
            minWidth: "130px",
          }}
          aria-label="ترتيب المنتجات"
        >
          {sortOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ background: "var(--carbon, #0D0D0D)", color: "var(--ivory)" }}
            >
              {opt.labelAr}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <span
          className="pointer-events-none absolute inset-y-0 end-2 flex items-center"
          aria-hidden="true"
          style={{ color: "var(--gold-border)" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  )
}

export default SortProducts
