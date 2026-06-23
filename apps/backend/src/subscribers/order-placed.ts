import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

type OrderPlacedData = { id: string }

async function sendEmail(opts: {
  to: string
  subject: string
  html: string
  apiKey: string
  from: string
}) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    }),
  })
}

type OrderShape = {
  display_id: number | string
  total: number
  email?: string | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    city?: string | null
  } | null
  items?: Array<{ title: string; quantity: number; unit_price: number }> | null
}

function adminEmailHtml(order: OrderShape): string {
  const addr = order.shipping_address
  const name = addr ? `${addr.first_name || ""} ${addr.last_name || ""}`.trim() : "---"
  const phone = addr?.phone || "---"
  const city = addr?.city || "---"
  const totalEgp = ((order.total || 0) / 100).toLocaleString("ar-EG")
  const itemsHtml =
    order.items
      ?.map(
        (item) =>
          `<tr><td style="padding:6px 12px;border-bottom:1px solid #2a2a2a;">${item.title}</td>` +
          `<td style="padding:6px 12px;border-bottom:1px solid #2a2a2a;text-align:center;">${item.quantity}</td>` +
          `<td style="padding:6px 12px;border-bottom:1px solid #2a2a2a;text-align:left;">${(item.unit_price / 100).toLocaleString("ar-EG")} j.m</td></tr>`
      )
      .join("") || ""

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#e8dcc8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" style="background:#141414;border:1px solid #2a2a2a;max-width:600px;width:100%;">
      <tr><td style="padding:24px 32px;border-bottom:1px solid #d4af37;">
        <span style="font-size:20px;font-weight:700;color:#d4af37;letter-spacing:0.08em;">ASUMA STORE</span>
        <span style="float:left;font-size:13px;color:#8a7a5a;margin-top:4px;">new order notification</span>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#e8dcc8;">Order #${order.display_id}</p>
        <table width="100%" style="margin-bottom:20px;">
          <tr><td style="color:#8a7a5a;padding:4px 0;font-size:13px;">Name</td><td style="color:#e8dcc8;font-size:14px;">${name}</td></tr>
          <tr><td style="color:#8a7a5a;padding:4px 0;font-size:13px;">Phone</td><td style="color:#e8dcc8;font-size:14px;" dir="ltr">${phone}</td></tr>
          <tr><td style="color:#8a7a5a;padding:4px 0;font-size:13px;">City</td><td style="color:#e8dcc8;font-size:14px;">${city}</td></tr>
          <tr><td style="color:#8a7a5a;padding:4px 0;font-size:13px;">Email</td><td style="color:#e8dcc8;font-size:14px;" dir="ltr">${order.email || "---"}</td></tr>
        </table>
        <table width="100%" style="border:1px solid #2a2a2a;border-collapse:collapse;margin-bottom:20px;">
          <tr style="background:#1e1e1e;"><th style="padding:8px 12px;text-align:right;font-size:12px;color:#8a7a5a;font-weight:500;">Product</th><th style="padding:8px 12px;text-align:center;font-size:12px;color:#8a7a5a;font-weight:500;">Qty</th><th style="padding:8px 12px;text-align:left;font-size:12px;color:#8a7a5a;font-weight:500;">Price</th></tr>
          ${itemsHtml}
        </table>
        <p style="text-align:left;font-size:18px;font-weight:700;color:#d4af37;margin:0;">Total: ${totalEgp} EGP</p>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #2a2a2a;text-align:center;font-size:11px;color:#4a4a4a;">Asuma Store automated notification</td></tr>
    </table>
  </td></tr>
</table></body></html>`
}

function customerEmailHtml(order: OrderShape): string {
  const totalEgp = ((order.total || 0) / 100).toLocaleString("ar-EG")
  const itemsHtml =
    order.items
      ?.map(
        (item) =>
          `<tr><td style="padding:6px 12px;border-bottom:1px solid #2a2a2a;">${item.title} x ${item.quantity}</td>` +
          `<td style="padding:6px 12px;border-bottom:1px solid #2a2a2a;text-align:left;">${((item.unit_price * item.quantity) / 100).toLocaleString("ar-EG")} j.m</td></tr>`
      )
      .join("") || ""

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#e8dcc8;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" style="background:#141414;border:1px solid #2a2a2a;max-width:600px;width:100%;">
      <tr><td style="padding:24px 32px;border-bottom:1px solid #d4af37;text-align:center;">
        <span style="font-size:22px;font-weight:700;color:#d4af37;letter-spacing:0.1em;">ASUMA STORE</span>
      </td></tr>
      <tr><td style="padding:32px 32px 20px;text-align:center;">
        <p style="font-size:32px;margin:0 0 8px;color:#d4af37;">&#10003;</p>
        <p style="font-size:20px;font-weight:700;margin:0 0 6px;color:#e8dcc8;">Order received!</p>
        <p style="font-size:13px;color:#8a7a5a;margin:0;">Order #${order.display_id}</p>
      </td></tr>
      <tr><td style="padding:0 32px 28px;">
        <p style="font-size:14px;color:#b0a080;margin:0 0 20px;line-height:1.6;">Thank you for your order from Asuma Store. Our team will contact you to confirm and arrange delivery.</p>
        <table width="100%" style="border:1px solid #2a2a2a;border-collapse:collapse;margin-bottom:20px;">
          ${itemsHtml}
        </table>
        <p style="text-align:left;font-size:16px;font-weight:700;color:#d4af37;margin:0;">Total: ${totalEgp} EGP</p>
        <p style="font-size:12px;color:#4a4a4a;margin:16px 0 0;">Cash on Delivery</p>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="font-size:12px;color:#4a4a4a;margin:0 0 6px;">Contact us</p>
        <p style="font-size:12px;color:#8a7a5a;margin:0;" dir="ltr">+20 103 316 3769 | asmafarouq.89m@gmail.com</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`
}

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<OrderPlacedData>) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || "noreply@asumastore.com"
  const adminEmail = process.env.NOTIFICATION_ADMIN_EMAIL

  try {
    const orderService = container.resolve("order")
    const order = await orderService.retrieveOrder(data.id, {
      relations: ["items", "shipping_address"],
    })

    if (!apiKey) {
      console.log(
        `[order-placed] RESEND_API_KEY not set — skipping email. Order #${order.display_id}, customer: ${order.email || "no email"}`
      )
      return
    }

    const sends: Promise<void>[] = []

    if (adminEmail) {
      sends.push(
        sendEmail({
          to: adminEmail,
          subject: `New order #${order.display_id} - Asuma Store`,
          html: adminEmailHtml(order as unknown as OrderShape),
          apiKey,
          from: `Asuma Store <${fromEmail}>`,
        }).catch((err: unknown) => {
          console.error(
            `[order-placed] Admin email failed for order #${order.display_id}:`,
            (err as Error)?.message
          )
        })
      )
    }

    if (order.email) {
      sends.push(
        sendEmail({
          to: order.email,
          subject: `Order confirmed #${order.display_id} - Asuma Store`,
          html: customerEmailHtml(order as unknown as OrderShape),
          apiKey,
          from: `Asuma Store <${fromEmail}>`,
        }).catch((err: unknown) => {
          console.error(
            `[order-placed] Customer email failed for order #${order.display_id}:`,
            (err as Error)?.message
          )
        })
      )
    }

    await Promise.all(sends)
    console.log(`[order-placed] Notifications dispatched for order #${order.display_id}`)
  } catch (err) {
    console.error(`[order-placed] Handler error (order not blocked):`, (err as Error)?.message)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
