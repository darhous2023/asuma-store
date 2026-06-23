import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div
      className="flex-1 py-8 small:py-12"
      style={{ backgroundColor: "var(--obsidian)", minHeight: "calc(100vh - 72px)" }}
      data-testid="account-page"
    >
      <div className="content-container max-w-5xl mx-auto">
        {/* Page header */}
        <div
          className="flex items-center gap-4 mb-8"
          style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: "1.5rem" }}
        >
          <div style={{ width: "32px", height: "1px", background: "var(--gold-border)" }} aria-hidden="true" />
          <h1
            className="font-display font-light italic uppercase"
            style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)" }}
          >
            حسابي
          </h1>
        </div>

        <div className="grid grid-cols-1 small:grid-cols-[220px_1fr] gap-8 small:gap-x-12">
          <div>{customer && <AccountNav customer={customer} />}</div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
