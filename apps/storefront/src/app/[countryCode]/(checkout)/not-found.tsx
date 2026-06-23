import InteractiveLink from "@modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404 | أسومة ستور",
  description: "الصفحة غير موجودة",
}

export default async function NotFound() {
  return (
    <div
      className="flex flex-col gap-6 items-center justify-center"
      style={{
        backgroundColor: "var(--obsidian)",
        minHeight: "calc(100vh - 72px)",
        color: "var(--ivory)",
      }}
    >
      <h1
        className="font-display font-light italic"
        style={{ color: "var(--ivory)", fontSize: "clamp(1.2rem, 3vw, 1.8rem)", letterSpacing: "0.08em" }}
      >
        الصفحة غير موجودة
      </h1>
      <p className="text-sm" style={{ color: "var(--ivory-muted)" }}>
        الصفحة التي تبحث عنها غير متاحة أو تم نقلها
      </p>
      <InteractiveLink href="/">العودة للرئيسية</InteractiveLink>
    </div>
  )
}
