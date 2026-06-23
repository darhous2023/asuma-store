"use client"

import { useEffect, useRef, useState } from "react"

export default function Loader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Skip if already shown this session
    if (sessionStorage.getItem("asuma_loader_done")) {
      setDone(true)
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

    // ─── "A" monogram target positions ───
    const A_POINTS: Array<{ x: number; y: number }> = []
    const cx = W / 2, cy = H / 2
    const scale = Math.min(W, H) * 0.18

    // left leg of A
    for (let t = 0; t <= 1; t += 0.045) {
      A_POINTS.push({ x: cx - scale * 0.5 + scale * 0.5 * t, y: cy + scale * 0.5 - scale * t })
    }
    // right leg of A
    for (let t = 0; t <= 1; t += 0.045) {
      A_POINTS.push({ x: cx + scale * 0.5 * t, y: cy - scale * 0.5 * t + scale * 0.5 })
    }
    // crossbar
    for (let t = 0; t <= 1; t += 0.06) {
      A_POINTS.push({ x: cx - scale * 0.25 + scale * 0.5 * t, y: cy + scale * 0.06 })
    }

    // ─── Particles ───
    const N = A_POINTS.length + 30
    interface Particle {
      x: number; y: number; tx: number; ty: number
      vx: number; vy: number; alpha: number; size: number
      color: string; inA: boolean
    }
    const particles: Particle[] = []

    for (let i = 0; i < N; i++) {
      const inA = i < A_POINTS.length
      particles.push({
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.5,
        tx: inA ? A_POINTS[i].x : cx + (Math.random() - 0.5) * scale * 2.4,
        ty: inA ? A_POINTS[i].y : cy + (Math.random() - 0.5) * scale * 2.4,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.3,
        size: Math.random() * 2 + 0.8,
        color: Math.random() > 0.5 ? GOLD : GOLD_BRIGHT,
        inA,
      })
    }

    let prog = 0
    let rafId: number
    let phase: "rain" | "coalesce" | "hold" | "exit" = "rain"
    let phaseTimer = 0

    const draw = () => {
      ctx.fillStyle = OBSIDIAN
      ctx.fillRect(0, 0, W, H)

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

      if (phase === "rain") {
        phaseTimer++
        prog = Math.min(phaseTimer / 80, 0.38)
        particles.forEach((p) => {
          p.y += p.vy
          p.x += p.vx
          if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W }
          ctx.globalAlpha = p.alpha * 0.7
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        })
        if (phaseTimer >= 80) { phase = "coalesce"; phaseTimer = 0 }
      } else if (phase === "coalesce") {
        phaseTimer++
        const t = Math.min(phaseTimer / 90, 1)
        prog = 0.38 + t * 0.52
        particles.forEach((p) => {
          p.x = lerp(p.x, p.tx, ease(t) * 0.08)
          p.y = lerp(p.y, p.ty, ease(t) * 0.08)
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        })
        // Draw gold ring that appears at 70%+
        if (t > 0.6) {
          const ringAlpha = (t - 0.6) / 0.4
          ctx.globalAlpha = ringAlpha * 0.6
          ctx.strokeStyle = GOLD
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(cx, cy, scale * 0.72, 0, Math.PI * 2)
          ctx.stroke()
        }
        if (phaseTimer >= 90) { phase = "hold"; phaseTimer = 0 }
      } else if (phase === "hold") {
        phaseTimer++
        prog = 0.9 + (phaseTimer / 30) * 0.1
        particles.forEach((p) => {
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.globalAlpha = 0.6
        ctx.strokeStyle = GOLD
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(cx, cy, scale * 0.72, 0, Math.PI * 2)
        ctx.stroke()
        if (phaseTimer >= 30) { phase = "exit"; phaseTimer = 0 }
      } else if (phase === "exit") {
        phaseTimer++
        const t = Math.min(phaseTimer / 20, 1)
        ctx.globalAlpha = 1 - t
        ctx.fillStyle = OBSIDIAN
        ctx.fillRect(0, 0, W, H)
        if (t >= 1) {
          cancelAnimationFrame(rafId)
          sessionStorage.setItem("asuma_loader_done", "1")
          setDone(true)
          return
        }
      }

      ctx.globalAlpha = 1
      setProgress(Math.round(prog * 100))
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (done) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--obsidian)",
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          width: `${progress}%`,
          background: "linear-gradient(90deg, var(--gold-dark), var(--gold-bright))",
          transition: "width 0.1s linear",
        }}
      />

      {/* Signature */}
      <p
        style={{
          position: "absolute",
          bottom: "24px",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: "var(--gold-dark, #8B7040)",
          textTransform: "uppercase",
        }}
      >
        designed by{" "}
        <a
          href="mailto:ahmeddarhous@gmail.com"
          style={{ color: "var(--gold, #C9A96E)", textDecoration: "none" }}
        >
          Ahmed Darhous
        </a>
      </p>
    </div>
  )
}
