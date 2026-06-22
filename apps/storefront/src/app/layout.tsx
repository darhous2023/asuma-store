import { getBaseURL } from "@lib/util/env"
import { getLocale } from "@lib/data/locale-actions"
import { I18nProvider } from "@lib/i18n"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <html lang={locale === "ar" ? "ar" : "en"} dir={locale === "ar" ? "rtl" : "ltr"} data-mode="light">
      <body>
        <I18nProvider initialLocale={locale}>
          <main className="relative">{props.children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
