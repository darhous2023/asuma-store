"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type SearchProduct = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  variants: Array<{
    calculated_price?: { calculated_amount: number; currency_code: string } | null
  }>
}

type Props = { locale?: string | null; countryCode?: string }

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function formatPrice(product: SearchProduct): string {
  const price = product.variants?.[0]?.calculated_price
  if (!price) return ""
  const amount = price.calculated_amount / 100
  return `${amount.toLocaleString("ar-EG")} ج.م`
}

export default function SearchModal({ locale, countryCode }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 380)
  const isAr = locale === "ar" || (!locale && true)

  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

  /* ── Search ── */
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setSearched(false)
      setError(false)
      return
    }
    setLoading(true)
    setError(false)
    setSearched(false)
    const controller = new AbortController()
    fetch(
      `${backendUrl}/store/products?q=${encodeURIComponent(debouncedQuery)}&limit=8&fields=id,title,handle,thumbnail,variants.calculated_price`,
      {
        headers: { "x-publishable-api-key": pubKey },
        signal: controller.signal,
      }
    )
      .then((r) => r.json())
      .then((data) => {
        setResults(data.products ?? [])
        setSearched(true)
        setLoading(false)
      })
      .catch((e) => {
        if (e.name !== "AbortError") { setError(true); setLoading(false) }
      })
    return () => controller.abort()
  }, [debouncedQuery, backendUrl, pubKey])

  /* ── Focus input on open ── */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
    else { setQuery(""); setResults([]); setSearched(false); setError(false) }
  }, [open])

  /* ── ESC to close ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  /* ── Click outside to close ── */
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) setOpen(false)
  }, [])

  /* ── Navigate to product ── */
  const go = useCallback(
    (handle: string) => {
      setOpen(false)
      router.push(`/${countryCode || "eg"}/products/${handle}`)
    },
    [router, countryCode]
  )

  const label = isAr ? "بحث" : "Search"
  const placeholder = isAr ? "ابحث عن منتج…" : "Search products…"
  const noResults = isAr ? "لا توجد نتائج" : "No results found"
  const errorMsg = isAr ? "حدث خطأ، أعد المحاولة" : "Something went wrong, try again"

  return (
    <>
      {/* Search icon button — added to nav */}
      <button
        onClick={() => setOpen(true)}
        aria-label={label}
        className="flex items-center justify-center transition-colors duration-200"
        style={{ color: "var(--ivory-dim)", width: 32, height: 32 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ivory-dim)")}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>

      {/* ── Search overlay ── */}
      {open && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4"
          style={{ backgroundColor: "rgba(10,10,10,0.88)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full"
            style={{
              maxWidth: "600px",
              backgroundColor: "var(--carbon)",
              border: "1px solid var(--gold-border)",
            }}
          >
            {/* Input row */}
            <div
              className="flex items-center gap-3 px-4"
              style={{ borderBottom: "1px solid var(--gold-border)", height: "56px" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "var(--gold-dark)", flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                dir={isAr ? "rtl" : "ltr"}
                className="flex-1 bg-transparent font-sans text-sm outline-none"
                style={{
                  color: "var(--ivory)",
                  caretColor: "var(--gold)",
                  fontSize: "0.9rem",
                }}
              />
              {loading && (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "1.5px solid var(--gold-border)",
                    borderTopColor: "var(--gold)",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.6s linear infinite",
                    flexShrink: 0,
                  }}
                />
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-xs transition-opacity duration-150 hover:opacity-60"
                style={{ color: "var(--ivory-muted)", letterSpacing: "0.05em" }}
              >
                ESC
              </button>
            </div>

            {/* Results */}
            {error && (
              <p
                className="font-sans text-sm px-4 py-5 text-center"
                style={{ color: "var(--ivory-muted)" }}
              >
                {errorMsg}
              </p>
            )}
            {searched && !loading && !error && results.length === 0 && (
              <p
                className="font-sans text-sm px-4 py-5 text-center"
                style={{ color: "var(--ivory-muted)" }}
              >
                {noResults}
              </p>
            )}
            {results.length > 0 && (
              <ul style={{ maxHeight: "360px", overflowY: "auto" }}>
                {results.map((product, i) => (
                  <li
                    key={product.id}
                    style={{
                      borderTop: i > 0 ? "1px solid var(--gold-border)" : undefined,
                    }}
                  >
                    <button
                      onClick={() => go(product.handle)}
                      className="w-full flex items-center gap-4 px-4 py-3 text-left transition-colors duration-150"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgba(212,175,55,0.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      {/* Thumbnail */}
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: "var(--carbon-2)",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="44px"
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              style={{ color: "var(--gold-border)" }}
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Text */}
                      <div
                        className="flex-1 min-w-0 text-right"
                        dir="rtl"
                      >
                        <p
                          className="font-sans text-sm truncate"
                          style={{ color: "var(--ivory)", lineHeight: 1.4 }}
                        >
                          {product.title}
                        </p>
                        {formatPrice(product) && (
                          <p
                            className="font-sans text-xs mt-0.5"
                            style={{ color: "var(--gold-dark)" }}
                          >
                            {formatPrice(product)}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Spin keyframe */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
