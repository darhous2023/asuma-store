import { Metadata } from "next"
import InteractiveLink from "@modules/common/components/interactive-link"

export const metadata: Metadata = {
  title: "404 | أسومة ستور",
  description: "السلة غير موجودة",
}

export default function NotFound() {
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
        السلة غير موجودة
      </h1>
      <p className="text-sm text-center max-w-xs" style={{ color: "var(--ivory-muted)" }}>
        السلة التي تبحث عنها غير متاحة. امسح الكوكيز وحاول مجدداً
      </p>
      <InteractiveLink href="/">العودة للرئيسية</InteractiveLink>
    </div>
  )
}
