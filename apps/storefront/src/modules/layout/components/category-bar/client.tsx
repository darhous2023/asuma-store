"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useRef } from "react"

type Category = { id: string; name: string; handle: string }

export default function CategoryBarClient({
  categories,
}: {
  categories: Category[]
}) {
  const pathname = usePathname()
  const countryCode = pathname.split("/")[1] || "eg"
  const scrollRef = useRef<HTMLDivElement>(null)

  const items = [
    { id: "all", name: "كل المنتجات", handle: null },
    ...categories,
  ]

  return (
    <div
      style={{
        backgroundColor: "var(--carbon, #0D0D0D)",
        borderBottom: "1px solid var(--gold-border, rgba(201,169,110,0.12))",
        position: "sticky",
        top: "72px",
        zIndex: 40,
      }}
    >
      <div
        style={{
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
      <div
        ref={scrollRef}
        className="content-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "nowrap",
          gap: "6px",
          padding: "10px 0",
          minWidth: "max-content",
          margin: "0 auto",
        }}
      >
        {items.map((cat) => {
          const href = cat.handle
            ? `/${countryCode}/categories/${cat.handle}`
            : `/${countryCode}/store`
          const isActive =
            cat.handle === null
              ? pathname.endsWith("/store")
              : pathname.includes(`/categories/${cat.handle}`)

          return (
            <Link
              key={cat.id}
              href={href}
              style={{
                flexShrink: 0,
                padding: "9px 18px",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                border: `1px solid ${isActive ? "var(--gold, #C9A96E)" : "var(--gold-border, rgba(201,169,110,0.2))"}`,
                color: isActive ? "var(--gold, #C9A96E)" : "var(--ivory-muted, #7A6A5A)",
                backgroundColor: isActive ? "rgba(201,169,110,0.06)" : "transparent",
                transition: "all 0.2s ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--gold, #C9A96E)"
                  e.currentTarget.style.borderColor = "var(--gold-border, rgba(201,169,110,0.4))"
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--ivory-muted, #7A6A5A)"
                  e.currentTarget.style.borderColor = "var(--gold-border, rgba(201,169,110,0.2))"
                }
              }}
            >
              {cat.name}
            </Link>
          )
        })}
      </div>
      </div>
    </div>
  )
}
