import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-10" style={{ backgroundColor: "var(--obsidian)", minHeight: "60vh" }}>
      <div className="content-container" data-testid="cart-container">
        {/* Header */}
        <div
          className="flex items-center gap-4 mb-8"
          style={{ borderBottom: "1px solid var(--gold-border)", paddingBottom: "1.5rem" }}
        >
          <div style={{ width: "32px", height: "1px", background: "var(--gold-border)" }} aria-hidden="true" />
          <h1
            className="font-display font-light italic uppercase"
            style={{ color: "var(--ivory)", letterSpacing: "0.18em", fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
          >
            سلة التسوق
          </h1>
        </div>

        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-8 small:gap-x-12">
            {/* Items */}
            <div
              className="flex flex-col gap-y-6 p-6"
              style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
            >
              {!customer && (
                <div
                  className="pb-4"
                  style={{ borderBottom: "1px solid var(--gold-border)" }}
                >
                  <SignInPrompt />
                </div>
              )}
              <ItemsTemplate cart={cart} />
            </div>

            {/* Summary */}
            <div className="relative">
              <div className="flex flex-col gap-y-4 sticky top-24">
                {cart?.region && (
                  <div
                    className="p-6"
                    style={{ backgroundColor: "var(--carbon)", border: "1px solid var(--gold-border)" }}
                  >
                    <Summary cart={cart} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
