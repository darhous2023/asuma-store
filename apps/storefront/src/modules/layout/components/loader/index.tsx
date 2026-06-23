"use client"

import { useEffect, useRef, useState } from "react"

export default function Loader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<"canvas" | "text" | "done">("canvas")
  const [progress, setProgress] = useState(0)
  const [textVisible, setTextVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("asuma_loader_done")) {
      setPhase("done")
      return
    }

    // Skip animation for users who prefer reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem("asuma_loader_done", "1")
      setPhase("done")
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const W = (canvas.width = window.innerWidth)
    const H = (canvas.height = window.innerHeight)

    const GOLD = "#C9A96E"
    const GOLD_BRIGHT = "#E5C882"
    const OBSIDIAN = "#060606"

    // ── Ring target points ──
    const RING: Array<{ x: number; y: number }> = []
    const cx = W / 2, cy = H / 2 - 40
    const r = Math.min(W, H) * 0.12
    for (let i = 0; i < 80; i++) {
      const a = (i / 80) * Math.PI * 2
      RING.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
    }

    // ── Particles ──
    interface P { x: number; y: number; tx: number; ty: number; vx: number; vy: number; alpha: number; size: number; color: string }
    const particles: P[] = []
    const N = RING.length + 40

    for (let i = 0; i < N; i++) {
      const inRing = i < RING.length
      particles.push({
        x: Math.random() * W,
        y: -30 - Math.random() * H * 0.6,
        tx: inRing ? RING[i].x : cx + (Math.random() - 0.5) * r * 3,
        ty: inRing ? RING[i].y : cy + (Math.random() - 0.5) * r * 3,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 2.5 + 0.8,
        alpha: Math.random() * 0.5 + 0.4,
        size: Math.random() * 2 + 0.8,
        color: Math.random() > 0.4 ? GOLD : GOLD_BRIGHT,
      })
    }

    let rafId: number
    let animPhase: "rain" | "coalesce" | "hold" = "rain"
    let timer = 0

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

    const draw = () => {
      ctx.fillStyle = OBSIDIAN
      ctx.fillRect(0, 0, W, H)

      if (animPhase === "rain") {
        timer++
        setProgress(Math.round((timer / 70) * 38))
        particles.forEach(p => {
          p.y += p.vy; p.x += p.vx
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W }
          ctx.globalAlpha = p.alpha * 0.65
          ctx.fillStyle = p.color
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        })
        if (timer >= 70) { animPhase = "coalesce"; timer = 0 }

      } else if (animPhase === "coalesce") {
        timer++
        const t = Math.min(timer / 80, 1)
        setProgress(Math.round(38 + t * 52))
        particles.forEach(p => {
          p.x = lerp(p.x, p.tx, ease(t) * 0.1)
          p.y = lerp(p.y, p.ty, ease(t) * 0.1)
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        })
        if (t > 0.55) {
          ctx.globalAlpha = ((t - 0.55) / 0.45) * 0.5
          ctx.strokeStyle = GOLD; ctx.lineWidth = 1
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
        }
        if (timer >= 80) { animPhase = "hold"; timer = 0 }

      } else {
        timer++
        setProgress(90 + Math.round((timer / 25) * 10))
        particles.forEach(p => {
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        })
        ctx.globalAlpha = 0.5; ctx.strokeStyle = GOLD; ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()

        if (timer >= 25) {
          ctx.globalAlpha = 1
          cancelAnimationFrame(rafId)
          setPhase("text")
          setTimeout(() => setTextVisible(true), 80)
          setTimeout(() => {
            sessionStorage.setItem("asuma_loader_done", "1")
            setPhase("done")
          }, 2200)
          return
        }
      }

      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (phase === "done") return null

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "var(--obsidian, #060606)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Canvas phase */}
      {phase === "canvas" && (
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      )}

      {/* Text phase */}
      {phase === "text" && (
        <div
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", gap: "16px",
            opacity: textVisible ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Gold ring decoration */}
          <div style={{
            width: "56px", height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold, #C9A96E), transparent)",
            marginBottom: "8px",
          }} />

          {/* Store name */}
          <h1 style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            fontWeight: 300, fontStyle: "italic",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ivory, #F5F0E8)",
            lineHeight: 1, margin: 0,
          }}>
            Asuma Store
          </h1>

          {/* Owner name */}
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
            fontWeight: 300, letterSpacing: "0.22em",
            color: "var(--gold, #C9A96E)",
            textTransform: "uppercase",
            opacity: 0.85, margin: 0,
          }}>
            By Asmaa Farouk
          </p>

          {/* Bottom divider */}
          <div style={{
            width: "56px", height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold-border, rgba(201,169,110,0.25)), transparent)",
            marginTop: "4px",
          }} />
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        height: "2px", width: `${progress}%`,
        background: "linear-gradient(90deg, var(--gold-dark, #8B7040), var(--gold-bright, #E5C882))",
        transition: "width 0.12s linear",
      }} />

      {/* Developer credit — absolute bottom, very small */}
      <p style={{
        position: "absolute", bottom: "18px",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: "9px", letterSpacing: "0.18em",
        color: "var(--ivory-muted, #7A6A5A)",
        opacity: 0.38, textTransform: "uppercase",
        userSelect: "none",
      }}>
        designed by Ahmed Darhous
      </p>
    </div>
  )
}
