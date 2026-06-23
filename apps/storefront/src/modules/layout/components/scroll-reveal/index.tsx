"use client"

import { useEffect } from "react"

export default function ScrollReveal() {
  useEffect(() => {
    const init = async () => {
      const elements = document.querySelectorAll<HTMLElement>(".reveal")
      if (!elements.length) return

      // Respect reduced-motion: show elements immediately without animation
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        elements.forEach((el) => {
          el.style.opacity = "1"
          el.style.transform = "none"
        })
        return
      }

      const { gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")
      gsap.registerPlugin(ScrollTrigger)

      elements.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: (i % 4) * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        )
      })
    }

    init()
    return () => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      })
    }
  }, [])

  return null
}
