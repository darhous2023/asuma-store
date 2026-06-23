import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import AsumaLogo from "@modules/common/components/asuma-logo"
import SearchModal from "@modules/search/components/search-modal"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header
        className="relative h-16 mx-auto duration-200"
        style={{
          backgroundColor: "var(--obsidian)",
          borderBottom: "1px solid var(--gold-border)",
        }}
      >
        <nav className="content-container flex items-center justify-between w-full h-full">
          {/* Left — hamburger menu */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          {/* Center — Asuma logo */}
          <div className="flex items-center h-full">
            <LocalizedClientLink href="/" data-testid="nav-store-link">
              <AsumaLogo size={32} showText={true} />
            </LocalizedClientLink>
          </div>

          {/* Right — search + lang + account + cart */}
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <SearchModal locale={currentLocale} countryCode="eg" />
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LanguageSwitcher />
              <LocalizedClientLink
                className="text-ivory-dim hover:text-gold transition-colors duration-200 text-sm tracking-wide"
                href="/account"
                data-testid="nav-account-link"
              >
                {currentLocale === "ar" ? "حسابي" : "Account"}
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-ivory-dim hover:text-gold transition-colors duration-200 text-sm flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {currentLocale === "ar" ? "السلة (0)" : "Cart (0)"}
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
