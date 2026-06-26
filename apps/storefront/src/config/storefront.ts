// Central storefront configuration — category handles, rails, and demo handles to exclude.
// All category references must use these constants, not inline strings.

export const CATEGORY_HANDLES = {
  accessories: "accessories",
  earrings: "earrings",
  necklaces: "necklaces",
  bracelets: "bracelets",
  rings: "rings",
  brooches: "brooches",
  hairAccessories: "hair-accessories",
  makeup: "makeup",
  perfumes: "perfumes",
  gifts: "gifts",
} as const

export const HOME_CATEGORY_RAILS: Array<{
  handle: keyof typeof CATEGORY_HANDLES
  titleAr: string
  limit: number
}> = [
  { handle: "earrings",  titleAr: "حلق",      limit: 8 },
  { handle: "necklaces", titleAr: "سلاسل",    limit: 8 },
  { handle: "bracelets", titleAr: "أساور",    limit: 8 },
  { handle: "rings",     titleAr: "خواتم",    limit: 8 },
]

export const DEMO_CATEGORY_HANDLES = ["shirts", "sweatshirts", "pants", "merch"]

export const STORE_CONFIG = {
  defaultRegion: "eg",
  currency: "EGP",
  salesChannelId: "sc_01KVQAHT4AHWP7NH0RG64FY6QW",
} as const
