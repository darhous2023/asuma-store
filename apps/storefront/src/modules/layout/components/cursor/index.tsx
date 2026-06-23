"use client"

import { useEffect, useRef } from "react"

export default function CustomCursor() {
  const spotlightRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const spotlight = spotlightRef.current
    const ring = ringRef.current
    if (!spotlight || !ring) return

    let mx = -999, my = -999
    let rx = -999, ry = -999
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }

    const tick = () => {
      // Spotlight follows instantly
      spotlight.style.transform = `translate(${mx - 175}px, ${my - 175}px)`

      // Ring lerps behind
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      ring.style.transform = `translate(${rx - 10}px, ${ry - 10}px)`

      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    rafId = requestAnimationFrame(tick)

    // Scale ring on interactive elements
    const onEnter = () => {
      if (ring) ring.style.transform += " scale(2)"
      if (ring) ring.style.opacity = "0.5"
    }
    const onLeave = () => {
      if (ring) ring.style.opacity = "1"
    }

    const addHover = () => {
      document.querySelectorAll("a, button, [role='button']").forEach((el) => {
        el.addEventListener("mouseenter", onEnter)
        el.addEventListener("mouseleave", onLeave)
      })
    }
    addHover()

    // Hide default cursor
    document.documentElement.style.cursor = "none"

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMove)
      document.documentElement.style.cursor = ""
      document.querySelectorAll("a, button, [role='button']").forEach((el) => {
        el.removeEventListener("mouseenter", onEnter)
        el.removeEventListener("mouseleave", onLeave)
      })
    }
  }, [])

  return (
    <>
      {/* Spotlight */}
      <div
        ref={spotlightRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)",
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 9997,
          willChange: "transform",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: "1px solid rgba(201,169,110,0.6)",
          pointerEvents: "none",
          zIndex: 9997,
          willChange: "transform",
          transition: "opacity 0.2s ease",
        }}
      />
    </>
  )
}
