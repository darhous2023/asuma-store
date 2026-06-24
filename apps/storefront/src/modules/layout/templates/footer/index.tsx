import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AsumaLogo from "@modules/common/components/asuma-logo"

const DEMO_HANDLES = ["shirts", "sweatshirts", "pants", "merch"]
const STORE_EMAIL = "asmafarouq.89m@gmail.com"
const WHATSAPP_NUMBER = "201033163769"

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/darhous/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/ahmed.darhous",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/darhous/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
  },
]

const INFO_LINKS = [
  { labelAr: "من نحن",                      href: "/content/about" },
  { labelAr: "تواصل معنا",                 href: "/content/contact" },
  { labelAr: "سياسة الخصوصية",            href: "/content/privacy-policy" },
  { labelAr: "الشروط والأحكام",           href: "/content/terms-of-use" },
  { labelAr: "الشحن والاستبدال والإرجاع", href: "/content/shipping-policy" },
]

export default async function Footer() {
  const productCategories = await listCategories()
  const mainCategories = (productCategories ?? []).filter(
    (c) => !c.parent_category && !DEMO_HANDLES.includes(c.handle ?? "")
  )

  return (
    <footer
      style={{
        backgroundColor: "var(--carbon)",
        borderTop: "1px solid var(--gold-border)",
      }}
    >
      <div className="content-container py-16">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-6">
            <LocalizedClientLink href="/">
              <AsumaLogo size={40} showText={true} />
            </LocalizedClientLink>
            <p className="font-sans leading-relaxed text-sm text-ivory-muted" style={{ maxWidth: "220px" }}>
              متجر إكسسوارات ومستحضرات تجميل فاخر · القاهرة، مصر
            </p>
            <p className="font-sans text-xs text-ivory-muted">
              Luxury beauty &amp; accessories · Cairo, Egypt
            </p>

          </div>

          {/* Col 2 — Categories */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-gold">
              الأقسام
            </h3>
            <ul className="flex flex-col gap-3">
              {mainCategories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/categories/${c.handle}`}
                    className="font-sans text-sm text-ivory-dim hover:text-gold transition-colors duration-200"
                    data-testid="footer-category-link"
                  >
                    {c.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Info links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-gold">
              معلومات
            </h3>
            <ul className="flex flex-col gap-3">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="font-sans text-sm text-ivory-dim hover:text-gold transition-colors duration-200"
                  >
                    {link.labelAr}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans text-xs uppercase tracking-[0.2em] text-gold">
              تواصل معنا
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="تواصل عبر واتساب"
                  className="font-sans text-sm text-ivory-dim hover:text-gold transition-colors duration-200 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  <span>+20 103 316 3769</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${STORE_EMAIL}`}
                  className="font-sans text-sm text-ivory-dim hover:text-gold transition-colors duration-200"
                >
                  {STORE_EMAIL}
                </a>
              </li>
              <li className="font-sans text-sm text-ivory-muted">
                القاهرة، مصر
              </li>
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          aria-hidden="true"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)",
            marginBottom: "1.5rem",
          }}
        />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center gap-5">
          {/* Copyright row */}
          <p className="font-sans text-xs text-ivory-muted text-center" style={{ letterSpacing: "0.05em" }}>
            © {new Date().getFullYear()}{" "}
            <a
              href={`mailto:${STORE_EMAIL}`}
              className="hover:text-gold transition-colors duration-200"
              style={{ color: "inherit" }}
            >
              أسومة ستور · Asuma Store
            </a>
            {" "}· جميع الحقوق محفوظة
          </p>

          {/* Social links row — centered */}
          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="text-ivory-muted hover:text-gold transition-colors duration-200 flex items-center justify-center"
                style={{ opacity: 0.5, padding: "13px", margin: "-13px" }}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Designer signature — centered */}
          <p
            className="font-sans text-ivory-muted text-center"
            style={{ fontSize: "9px", letterSpacing: "0.12em", opacity: 0.35, textTransform: "uppercase" }}
          >
            Designed &amp; Developed by{" "}
            <a
              href="mailto:ahmeddarhous@gmail.com"
              className="hover:opacity-70 transition-opacity duration-200"
              style={{ color: "inherit" }}
            >
              Ahmed Darhous
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
