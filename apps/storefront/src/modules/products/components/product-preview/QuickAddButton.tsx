"use client"

import { addToCart } from "@lib/data/cart"
import { useState } from "react"

export default function QuickAddButton({
  variantId,
  countryCode,
}: {
  variantId: string
  countryCode: string
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")

  const handle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (status !== "idle") return
    setStatus("loading")
    try {
      await addToCart({ variantId, quantity: 1, countryCode })
      setStatus("done")
      setTimeout(() => setStatus("idle"), 2200)
    } catch {
      setStatus("idle")
    }
  }

  return (
    <button
      onClick={handle}
      aria-label="أضف للسلة"
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${status === "done" ? "var(--gold)" : "rgba(201,169,110,0.5)"}`,
        backgroundColor: status === "done" ? "rgba(201,169,110,0.15)" : "rgba(6,6,6,0.75)",
        color: "var(--gold)",
        backdropFilter: "blur(4px)",
        cursor: status === "loading" ? "wait" : "pointer",
        transition: "all 0.2s ease",
        fontSize: "16px",
        lineHeight: 1,
        zIndex: 10,
      }}
    >
      {status === "loading" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : status === "done" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  )
}
