import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404 | أسومة ستور",
  description: "الصفحة غير موجودة",
}

export default function NotFound() {
  return (
    <div
      className="flex flex-col gap-6 items-center justify-center"
      style={{
        backgroundColor: "var(--obsidian)",
        minHeight: "100vh",
        color: "var(--ivory)",
      }}
    >
      <div
        className="font-display font-light"
        style={{ fontSize: "clamp(4rem, 15vw, 8rem)", color: "var(--gold-border)", letterSpacing: "0.1em", lineHeight: 1 }}
      >
        404
      </div>
      <div
        aria-hidden="true"
        style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)" }}
      />
      <h1
        className="font-display font-light italic"
        style={{ color: "var(--ivory)", fontSize: "clamp(1.2rem, 3vw, 1.8rem)", letterSpacing: "0.08em" }}
      >
        الصفحة غير موجودة
      </h1>
      <p className="text-sm" style={{ color: "var(--ivory-muted)" }}>
        الصفحة التي تبحث عنها غير متاحة أو تم نقلها
      </p>
      <Link
        href="/"
        className="text-sm uppercase tracking-[0.18em] transition-colors duration-200"
        style={{ color: "var(--gold)", borderBottom: "1px solid var(--gold-border)", paddingBottom: "2px" }}
      >
        العودة للرئيسية
      </Link>
    </div>
  )
}
