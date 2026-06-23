"use client"

import { ArrowRightOnRectangle } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MapPin from "@modules/common/icons/map-pin"
import Package from "@modules/common/icons/package"
import User from "@modules/common/icons/user"

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  return (
    <div>
      {/* Mobile nav */}
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-sm py-2 transition-colors duration-200"
            style={{ color: "var(--gold)" }}
            data-testid="account-main-link"
          >
            <ChevronDown className="transform rotate-90" />
            <span>حسابي</span>
          </LocalizedClientLink>
        ) : (
          <>
            <div
              className="text-lg mb-4"
              style={{ color: "var(--ivory)", fontFamily: "var(--font-display)" }}
            >
              مرحباً، {customer?.first_name}
            </div>
            <div className="text-sm">
              <ul>
                {[
                  { href: "/account/profile", label: "الملف الشخصي", icon: <User size={18} /> },
                  { href: "/account/addresses", label: "العناوين", icon: <MapPin size={18} /> },
                  { href: "/account/orders", label: "الطلبات", icon: <Package size={18} /> },
                ].map(({ href, label, icon }) => (
                  <li key={href}>
                    <LocalizedClientLink
                      href={href}
                      className="flex items-center justify-between py-4 px-4 transition-colors duration-200"
                      style={{
                        borderBottom: "1px solid var(--gold-border)",
                        color: "var(--ivory-dim)",
                      }}
                    >
                      <div className="flex items-center gap-x-2">
                        {icon}
                        <span>{label}</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </LocalizedClientLink>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 px-4 w-full transition-colors duration-200"
                    style={{ color: "var(--ivory-muted)" }}
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>تسجيل الخروج</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Desktop nav */}
      <div
        className="hidden small:block p-6"
        style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
        data-testid="account-nav"
      >
        <div
          className="text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: "var(--gold-dark)" }}
        >
          القائمة
        </div>
        <ul className="flex flex-col gap-y-1">
          {[
            { href: "/account", label: "نظرة عامة" },
            { href: "/account/profile", label: "الملف الشخصي" },
            { href: "/account/addresses", label: "العناوين" },
            { href: "/account/orders", label: "الطلبات" },
          ].map(({ href, label }) => (
            <li key={href}>
              <AccountNavLink href={href} route={route!}>
                {label}
              </AccountNavLink>
            </li>
          ))}
          <li className="mt-4 pt-4" style={{ borderTop: "1px solid var(--gold-border)" }}>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm transition-colors duration-200 w-full text-right"
              style={{ color: "var(--ivory-muted)" }}
              data-testid="logout-button"
            >
              تسجيل الخروج
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className="block text-sm py-2 px-2 transition-colors duration-200"
      style={{
        color: active ? "var(--gold)" : "var(--ivory-dim)",
        borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
        paddingLeft: "0.75rem",
      }}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
