"use client"

type ContactCard = { icon: "phone" | "email" | "location"; labelAr: string; labelEn: string; href?: string }

const ICONS = {
  phone: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  email: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  location: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
}

export default function ContactCards({ cards, lang }: { cards: ContactCard[]; lang: "ar" | "en" }) {
  return (
    <div className="flex flex-col gap-4 mt-8">
      {cards.map((card) => {
        const label = lang === "ar" ? card.labelAr : card.labelEn
        const key = card.icon + (lang === "en" ? "-en" : "")
        const inner = (
          <>
            <span style={{ color: "var(--gold)", flexShrink: 0 }}>{ICONS[card.icon]}</span>
            <span className="font-sans" style={{ fontSize: "0.9rem", direction: card.icon === "phone" || card.icon === "email" ? "ltr" : undefined }}>{label}</span>
          </>
        )
        if (card.href) {
          return (
            <a
              key={key}
              href={card.href}
              target={card.icon === "phone" ? "_blank" : undefined}
              rel={card.icon === "phone" ? "noopener noreferrer" : undefined}
              className="contact-card flex items-center gap-4 transition-all duration-200"
              style={{
                padding: "1rem 1.25rem",
                border: "1px solid var(--gold-border)",
                color: "var(--ivory-dim)",
                textDecoration: "none",
              }}
            >
              {inner}
            </a>
          )
        }
        return (
          <div
            key={key}
            className="flex items-center gap-4"
            style={{
              padding: "1rem 1.25rem",
              border: "1px solid var(--gold-border)",
              color: "var(--ivory-dim)",
            }}
          >
            {inner}
          </div>
        )
      })}
      <style>{`
        .contact-card:hover {
          border-color: var(--gold) !important;
          color: var(--ivory) !important;
        }
      `}</style>
    </div>
  )
}
