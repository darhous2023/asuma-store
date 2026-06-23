import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div
      className="py-10"
      style={{ backgroundColor: "var(--obsidian)", minHeight: "calc(100vh - 72px)" }}
    >
      <div className="content-container max-w-4xl mx-auto flex flex-col gap-y-8">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        {/* Success header */}
        <div className="text-center py-10">
          {/* Gold checkmark */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ border: "1px solid var(--gold-border)", backgroundColor: "var(--carbon)" }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14L11 19L22 9" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1
            className="font-display font-light italic"
            style={{ color: "var(--ivory)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", letterSpacing: "0.05em" }}
          >
            تم استلام طلبك
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--ivory-muted)" }}>
            شكراً لتسوقك في أسومة ستور — سنتواصل معك قريبًا لتأكيد التوصيل
          </p>
          <div
            aria-hidden="true"
            className="mx-auto mt-6"
            style={{ width: "80px", height: "1px", background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)" }}
          />
        </div>

        {/* Order panel */}
        <div
          className="flex flex-col gap-6 p-6 small:p-8"
          style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
          data-testid="order-complete-container"
        >
          <div style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: "1rem" }}>
            <span
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--gold-dark)" }}
            >
              تفاصيل الطلب
            </span>
          </div>
          <OrderDetails order={order} />

          <div style={{ borderTop: "1px solid var(--gold-border)", paddingTop: "1rem" }}>
            <span
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--gold-dark)" }}
            >
              المنتجات
            </span>
          </div>
          <Items order={order} />
          <CartTotals totals={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
        </div>

        <Help />
      </div>
    </div>
  )
}
