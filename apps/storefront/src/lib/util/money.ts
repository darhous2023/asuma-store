import { isEmpty } from "./isEmpty"

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

  // Default to no decimals for whole-number amounts — avoids "EGP 149.00"
  const isWholeNumber = amount % 1 === 0
  const minFrac = minimumFractionDigits ?? (isWholeNumber ? 0 : 2)
  const maxFrac = maximumFractionDigits ?? (isWholeNumber ? 0 : 2)

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  }).format(amount)
}
