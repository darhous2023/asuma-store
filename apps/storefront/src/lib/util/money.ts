import { isEmpty } from "./isEmpty"
import { noDivisionCurrencies } from "@lib/constants"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) return amount.toString()

  // Medusa stores amounts in the smallest currency unit (piasters/cents).
  // Zero-decimal currencies (JPY, KRW…) must not be divided.
  const factor = noDivisionCurrencies.includes(currency_code.toLowerCase()) ? 1 : 100
  const displayAmount = amount / factor

  // No trailing .00 for whole numbers (e.g. EGP 149, not EGP 149.00)
  const isWholeNumber = displayAmount % 1 === 0
  const minFrac = minimumFractionDigits ?? (isWholeNumber ? 0 : 2)
  const maxFrac = maximumFractionDigits ?? (isWholeNumber ? 0 : 2)

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  }).format(displayAmount)
}
