import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import AsumaLogo from "@modules/common/components/asuma-logo"
import SearchModal from "@modules/search/components/search-modal"

export default async function Nav() {
  const [regions] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
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
              <SideMenu regions={regions} />
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
            <SearchModal locale={null} countryCode="eg" />
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="text-ivory-dim hover:text-gold transition-colors duration-200 text-sm tracking-wide"
                href="/account"
                data-testid="nav-account-link"
              >
                حسابي
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-ivory-dim hover:text-gold transition-colors duration-200 flex items-center gap-1.5"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
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
