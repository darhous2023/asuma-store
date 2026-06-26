"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Fragment, useRef, useState, useEffect, useId, useCallback } from "react"

type Child = { id: string; name: string; handle: string }
type Category = { id: string; name: string; handle: string; children: Child[] }

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [ref, onClose])
}

function CategoryDropdown({
  cat,
  countryCode,
  pathname,
}: {
  cat: Category
  countryCode: string
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const menuId = `cat-menu-${id}`
  const btnId = `cat-btn-${id}`
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close)

  const href = `/${countryCode}/categories/${cat.handle}`
  const isActive = pathname.includes(`/categories/${cat.handle}`)

  const btnStyle = {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "9px 18px",
    fontFamily: "var(--font-space-grotesk), sans-serif",
    fontSize: "12px",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
    border: `1px solid ${isActive || open ? "var(--gold)" : "var(--gold-border)"}`,
    color: isActive || open ? "var(--gold)" : "var(--ivory-muted)",
    backgroundColor: isActive || open ? "rgba(201,169,110,0.06)" : "transparent",
    transition: "all 0.2s ease",
    cursor: "pointer",
    background: "none",
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Parent label — navigates to parent category page */}
        <Link
          href={href}
          style={{ ...btnStyle, borderRight: "none", paddingRight: "10px" }}
          onMouseEnter={(e) => {
            if (!isActive && !open) {
              e.currentTarget.style.color = "var(--gold)"
              e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)"
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive && !open) {
              e.currentTarget.style.color = "var(--ivory-muted)"
              e.currentTarget.style.borderColor = "var(--gold-border)"
            }
          }}
          aria-label={cat.name}
        >
          {cat.name}
        </Link>
        {/* Chevron toggle for dropdown */}
        <button
          id={btnId}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Escape") close()
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((v) => !v) }
          }}
          style={{
            ...btnStyle,
            padding: "9px 10px",
            borderLeft: "1px solid var(--gold-border)",
          }}
          aria-label={`فتح قائمة ${cat.name}`}
        >
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
            aria-hidden="true"
          >
            <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={btnId}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: "0",
            minWidth: "160px",
            backgroundColor: "var(--carbon)",
            border: "1px solid var(--gold-border)",
            zIndex: 60,
            padding: "6px 0",
          }}
          onKeyDown={(e) => { if (e.key === "Escape") close() }}
        >
          {cat.children.map((child) => (
            <Link
              key={child.id}
              href={`/${countryCode}/categories/${child.handle}`}
              role="menuitem"
              onClick={close}
              style={{
                display: "block",
                padding: "10px 18px",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: pathname.includes(`/categories/${child.handle}`)
                  ? "var(--gold)"
                  : "var(--ivory-muted)",
                textDecoration: "none",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--gold)" }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = pathname.includes(`/categories/${child.handle}`)
                  ? "var(--gold)" : "var(--ivory-muted)"
              }}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryLink({
  cat,
  countryCode,
  pathname,
}: {
  cat: Omit<Category, "children">
  countryCode: string
  pathname: string
}) {
  const isActive = cat.handle
    ? pathname.includes(`/categories/${cat.handle}`)
    : pathname.endsWith("/store")
  const href = cat.handle ? `/${countryCode}/categories/${cat.handle}` : `/${countryCode}/store`

  return (
    <Link
      href={href}
      style={{
        flexShrink: 0,
        padding: "9px 18px",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: "12px",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        border: `1px solid ${isActive ? "var(--gold)" : "var(--gold-border)"}`,
        color: isActive ? "var(--gold)" : "var(--ivory-muted)",
        backgroundColor: isActive ? "rgba(201,169,110,0.06)" : "transparent",
        transition: "all 0.2s ease",
        textDecoration: "none",
        display: "block",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--gold)"
          e.currentTarget.style.borderColor = "rgba(201,169,110,0.4)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--ivory-muted)"
          e.currentTarget.style.borderColor = "var(--gold-border)"
        }
      }}
    >
      {cat.name}
    </Link>
  )
}

export default function CategoryNavClient({ categories }: { categories: Category[] }) {
  const pathname = usePathname()
  const countryCode = pathname.split("/")[1] || "eg"

  return (
    <nav
      aria-label="تصفح الأقسام"
      style={{
        backgroundColor: "var(--carbon)",
        borderBottom: "1px solid var(--gold-border)",
        position: "sticky",
        top: "72px",
        zIndex: 40,
      }}
    >
      <div style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div
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
          <CategoryLink
            cat={{ id: "all", name: "كل المنتجات", handle: null as unknown as string }}
            countryCode={countryCode}
            pathname={pathname}
          />
          {categories.map((cat) =>
            cat.children.length > 0 ? (
              <CategoryDropdown
                key={cat.id}
                cat={cat}
                countryCode={countryCode}
                pathname={pathname}
              />
            ) : (
              <CategoryLink
                key={cat.id}
                cat={cat}
                countryCode={countryCode}
                pathname={pathname}
              />
            )
          )}
        </div>
      </div>
    </nav>
  )
}
