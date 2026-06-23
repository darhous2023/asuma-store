import { getBaseURL } from "@lib/util/env"
import { getLocale } from "@lib/data/locale-actions"
import { I18nProvider } from "@lib/i18n"
import { Metadata } from "next"
import { Cormorant_Garamond, Space_Grotesk, Noto_Kufi_Arabic } from "next/font/google"
import "styles/globals.css"
import Loader from "@modules/layout/components/loader"
import CustomCursor from "@modules/layout/components/cursor"
import ScrollReveal from "@modules/layout/components/scroll-reveal"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale()
  const isRtl = locale === "ar"

  return (
    <html
      lang={isRtl ? "ar" : "en"}
      dir={isRtl ? "rtl" : "ltr"}
      data-mode="light"
      className={`${cormorant.variable} ${spaceGrotesk.variable} ${notoKufiArabic.variable}`}
    >
      <body className="font-sans antialiased">
        <Loader />
        <CustomCursor />
        <ScrollReveal />
        <I18nProvider initialLocale={locale}>
          <main className="relative">{props.children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
