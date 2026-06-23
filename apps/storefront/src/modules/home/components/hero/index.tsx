import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section
      className="relative w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        minHeight: "92vh",
        backgroundColor: "var(--obsidian)",
      }}
    >
      {/* ── Radial gold glow ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 55%, rgba(201,169,110,0.09) 0%, transparent 75%)",
        }}
      />

      {/* ── Horizontal gold rule ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)" }}
      />

      {/* ── Content ── */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{ animation: "fade-up 1s var(--ease-luxury) both" }}
      >
        {/* Eyebrow */}
        <p
          className="font-sans tracking-[0.35em] uppercase mb-8 text-xs"
          style={{ color: "var(--gold)", animationDelay: "0.1s" }}
        >
          Cairo · Egypt · Est. 2024
        </p>

        {/* Arabic headline */}
        <h1
          className="font-arabic font-light leading-tight mb-2"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 6.5rem)",
            color: "var(--ivory)",
            letterSpacing: "-0.01em",
          }}
        >
          متجر عصومة
        </h1>

        {/* English headline */}
        <h2
          className="font-display font-light italic tracking-widest uppercase mb-10"
          style={{
            fontSize: "clamp(1.1rem, 3vw, 2rem)",
            color: "var(--gold)",
            letterSpacing: "0.3em",
          }}
        >
          Asuma Store
        </h2>

        {/* Gold divider */}
        <div
          aria-hidden="true"
          className="mb-10"
          style={{
            width: "60px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
          }}
        />

        {/* Tagline */}
        <p
          className="font-sans mb-12 tracking-wide"
          style={{
            color: "var(--ivory-dim)",
            fontSize: "0.9rem",
            letterSpacing: "0.08em",
          }}
        >
          إكسسوارات · شعر · مكياج · عطور · هدايا
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <LocalizedClientLink
            href="/store"
            className="relative group inline-flex items-center justify-center px-10 py-3 text-sm tracking-[0.15em] uppercase font-sans transition-all duration-300"
            style={{
              border: "1px solid var(--gold)",
              color: "var(--gold)",
              letterSpacing: "0.15em",
            }}
          >
            <span
              className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{ background: "var(--gold-muted)" }}
            />
            <span className="relative">تسوق الآن</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center justify-center px-10 py-3 text-sm tracking-[0.15em] uppercase font-sans transition-all duration-300 hover:opacity-70"
            style={{
              color: "var(--ivory-dim)",
              letterSpacing: "0.15em",
            }}
          >
            Shop Now →
          </LocalizedClientLink>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: "scroll-bounce 2s ease-in-out infinite", color: "var(--gold-dark)" }}
        aria-hidden="true"
      >
        <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, var(--gold-border), transparent)" }} />
        <span className="font-sans text-xs tracking-[0.2em] uppercase" style={{ fontSize: "0.6rem" }}>
          scroll
        </span>
      </div>

      {/* ── Bottom gold rule ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)" }}
      />
    </section>
  )
}

export default Hero
