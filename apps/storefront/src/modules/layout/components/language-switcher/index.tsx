"use client"

import { useI18n } from "@lib/i18n"

export default function LanguageSwitcher() {
  const { locale, setLocale, isPending } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      disabled={isPending}
      className="flex items-center gap-1 text-sm font-medium hover:text-ui-fg-base transition-colors disabled:opacity-50"
      aria-label="Switch language"
    >
      {isPending ? "..." : locale === "en" ? "العربية" : "English"}
    </button>
  )
}
