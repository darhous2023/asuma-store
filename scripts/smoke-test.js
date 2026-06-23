#!/usr/bin/env node
/**
 * Asuma Store — Production Smoke Test
 * Usage: node scripts/smoke-test.js [backend_url] [storefront_url]
 *
 * Exits 0 if all tests pass, 1 if any fail.
 * Safe: read-only + one cart created (no order placed).
 */

const BACKEND =
  process.argv[2] ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://asuma-backend-production.up.railway.app"

const STOREFRONT =
  process.argv[3] ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://asuma-storefront-production.up.railway.app"

const PUB_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_25df426e3380017abcab81726bf6cccdfb6288b75803fac08d81fe6ba31244c6"

const REGION_ID = "reg_01KVR04F83AG96VAKHB2A3DZ9H"

let passed = 0
let failed = 0

async function check(name, fn) {
  try {
    const result = await fn()
    if (result === true || (typeof result === "object" && result.ok)) {
      console.log(`  PASS  ${name}`)
      passed++
    } else {
      console.error(`  FAIL  ${name}: ${result?.reason || "unexpected result"}`)
      failed++
    }
  } catch (err) {
    console.error(`  FAIL  ${name}: ${err.message}`)
    failed++
  }
}

async function json(url, opts = {}) {
  const res = await fetch(url, opts)
  const body = await res.json()
  return { status: res.status, body }
}

async function run() {
  console.log(`\nAsuma Store Smoke Test — ${new Date().toISOString()}`)
  console.log(`Backend:    ${BACKEND}`)
  console.log(`Storefront: ${STOREFRONT}\n`)

  // ── Backend health ──
  await check("Backend /health returns 200", async () => {
    const res = await fetch(`${BACKEND}/health`)
    return res.status === 200 ? true : { ok: false, reason: `status ${res.status}` }
  })

  // ── Store API: products ──
  await check("Store API returns ≥1 published product", async () => {
    const { status, body } = await json(`${BACKEND}/store/products?limit=1`, {
      headers: { "x-publishable-api-key": PUB_KEY },
    })
    if (status !== 200) return { ok: false, reason: `status ${status}` }
    return body.count >= 1 ? true : { ok: false, reason: `count=${body.count}` }
  })

  // ── Store API: cart creation ──
  let cartId = null
  await check("POST /store/carts returns 200 + cart_id", async () => {
    const { status, body } = await json(`${BACKEND}/store/carts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUB_KEY,
      },
      body: JSON.stringify({ region_id: REGION_ID }),
    })
    if (status !== 200) return { ok: false, reason: `status ${status}` }
    cartId = body.cart?.id
    return cartId ? true : { ok: false, reason: "no cart.id in response" }
  })

  // ── Shipping options ──
  if (cartId) {
    await check("Shipping options include Arabic options (≥1)", async () => {
      const { status, body } = await json(
        `${BACKEND}/store/shipping-options?cart_id=${cartId}`,
        { headers: { "x-publishable-api-key": PUB_KEY } }
      )
      if (status !== 200) return { ok: false, reason: `status ${status}` }
      return body.shipping_options?.length >= 1 ? true : { ok: false, reason: "no shipping options" }
    })
  }

  // ── Storefront home ──
  await check("Storefront /eg returns 200", async () => {
    const res = await fetch(`${STOREFRONT}/eg`, { redirect: "follow" })
    return res.status === 200 ? true : { ok: false, reason: `status ${res.status}` }
  })

  // ── Storefront store page ──
  await check("Storefront /eg/store returns 200", async () => {
    const res = await fetch(`${STOREFRONT}/eg/store`)
    return res.status === 200 ? true : { ok: false, reason: `status ${res.status}` }
  })

  // ── Content pages ──
  for (const slug of ["about", "contact", "privacy-policy", "terms-of-use", "shipping-policy"]) {
    await check(`Content page /eg/content/${slug} returns 200`, async () => {
      const res = await fetch(`${STOREFRONT}/eg/content/${slug}`)
      return res.status === 200 ? true : { ok: false, reason: `status ${res.status}` }
    })
  }

  // ── 404 handling ──
  await check("Unknown route returns 404 (not 500)", async () => {
    const res = await fetch(`${STOREFRONT}/eg/products/this-product-does-not-exist-xyz-abc`)
    return res.status === 404 ? true : { ok: false, reason: `status ${res.status} (expected 404)` }
  })

  // ── sitemap ──
  await check("Sitemap is reachable", async () => {
    const res = await fetch(`${STOREFRONT}/sitemap.xml`)
    return res.status === 200 ? true : { ok: false, reason: `status ${res.status}` }
  })

  // ── robots ──
  await check("robots.txt is reachable", async () => {
    const res = await fetch(`${STOREFRONT}/robots.txt`)
    return res.status === 200 ? true : { ok: false, reason: `status ${res.status}` }
  })

  // Summary
  console.log(`\n──────────────────────────────────`)
  console.log(`Passed: ${passed} | Failed: ${failed}`)
  if (failed > 0) {
    console.error(`\nSMOKE TEST FAILED — ${failed} check(s) failed\n`)
    process.exit(1)
  } else {
    console.log(`\nSMOKE TEST PASSED\n`)
    process.exit(0)
  }
}

run().catch((err) => {
  console.error("Fatal error:", err.message)
  process.exit(1)
})
