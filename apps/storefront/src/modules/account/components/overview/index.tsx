import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper">
      {/* Welcome header */}
      <div className="flex justify-between items-center mb-6">
        <span
          className="font-display font-light"
          style={{ color: "var(--ivory)", fontSize: "1.4rem" }}
          data-testid="welcome-message"
          data-value={customer?.first_name}
        >
          مرحباً، {customer?.first_name}
        </span>
        <span className="text-xs" style={{ color: "var(--ivory-muted)" }}>
          {customer?.email}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="p-4 flex flex-col gap-1"
          style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
        >
          <span className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--gold-dark)" }}>اكتمال الملف</span>
          <span
            className="font-display text-2xl font-light"
            style={{ color: "var(--gold)" }}
            data-testid="customer-profile-completion"
            data-value={getProfileCompletion(customer)}
          >
            {getProfileCompletion(customer)}%
          </span>
        </div>
        <div
          className="p-4 flex flex-col gap-1"
          style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
        >
          <span className="text-xs uppercase tracking-[0.15em]" style={{ color: "var(--gold-dark)" }}>العناوين المحفوظة</span>
          <span
            className="font-display text-2xl font-light"
            style={{ color: "var(--gold)" }}
            data-testid="addresses-count"
            data-value={customer?.addresses?.length || 0}
          >
            {customer?.addresses?.length || 0}
          </span>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: "0.75rem" }}>
          <div style={{ width: "20px", height: "1px", background: "var(--gold-border)" }} />
          <h3 className="text-xs uppercase tracking-[0.18em]" style={{ color: "var(--ivory-dim)" }}>آخر الطلبات</h3>
        </div>
        <ul className="flex flex-col gap-y-3" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <li
                key={order.id}
                data-testid="order-wrapper"
                data-value={order.id}
              >
                <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
                  <div
                    className="flex justify-between items-center p-4 transition-colors duration-200"
                    style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
                  >
                    <div className="grid grid-cols-3 gap-x-4 text-xs flex-1">
                      <div className="flex flex-col gap-1">
                        <span style={{ color: "var(--gold-dark)" }}>التاريخ</span>
                        <span style={{ color: "var(--ivory-dim)" }} data-testid="order-created-date">
                          {new Date(order.created_at).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span style={{ color: "var(--gold-dark)" }}>رقم الطلب</span>
                        <span style={{ color: "var(--ivory-dim)" }} data-testid="order-id" data-value={order.display_id}>
                          #{order.display_id}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span style={{ color: "var(--gold-dark)" }}>الإجمالي</span>
                        <span style={{ color: "var(--gold)" }} data-testid="order-amount">
                          {convertToLocale({ amount: order.total, currency_code: order.currency_code })}
                        </span>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--gold-dark)", flexShrink: 0 }}>
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </LocalizedClientLink>
              </li>
            ))
          ) : (
            <div
              className="text-center py-8 text-sm"
              style={{ color: "var(--ivory-muted)", border: "1px dashed var(--gold-border)" }}
              data-testid="no-orders-message"
            >
              لا توجد طلبات بعد
            </div>
          )}
        </ul>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0
  if (!customer) return 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  const billingAddress = customer.addresses?.find((addr) => addr.is_default_billing)
  if (billingAddress) count++
  return (count / 4) * 100
}

export default Overview
