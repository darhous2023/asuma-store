"use client"

import { createContext, useContext, useState, ReactNode, useTransition } from "react"
import { updateLocale } from "@lib/data/locale-actions"
import en from "../../locales/en.json"
import ar from "../../locales/ar.json"

type Locale = "en" | "ar"
type Messages = typeof en

const messages: Record<Locale, Messages> = { en, ar }

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
  isPending: boolean
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
  dir: "ltr",
  isPending: false,
})

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale?: string | null
}) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale === "ar" ? "ar" : "en"
  )
  const [isPending, startTransition] = useTransition()

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    startTransition(async () => {
      await updateLocale(newLocale)
    })
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = messages[locale]
    for (const k of keys) {
      value = value?.[k]
    }
    return typeof value === "string" ? value : key
  }

  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, isPending }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
