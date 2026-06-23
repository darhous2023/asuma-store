# Asuma Store — Owner Manual

> For store owner and operators. Non-technical guide to running the store day-to-day.
> For technical operations and incident response, see `docs/RUNBOOKS.md`.

---

## Quick Links

| Resource | URL |
|---|---|
| **Storefront** (live site) | https://asuma-storefront-production.up.railway.app |
| **Admin Panel** | https://asuma-backend-production.up.railway.app/app |
| **Railway Dashboard** | https://railway.com |
| **Supabase Dashboard** | https://supabase.com/dashboard |

---

## 1. Logging Into the Admin Panel

1. Open https://asuma-backend-production.up.railway.app/app in your browser.
2. Enter your email: **ahmeddarhous@gmail.com**
3. Enter your current password.
4. You land on the Orders dashboard.

> If you cannot log in: see `docs/RUNBOOKS.md` → RB-5 (Admin Recovery).

---

## 2. Managing Orders

### View Orders

- Admin → **Orders** in the left sidebar.
- Each row: order number, customer name, date, items, total (EGP), status.
- Click any order to open the full details.

### Order Statuses

| Status | Meaning |
|---|---|
| **Pending** | New order placed via COD. Needs your action. |
| **Processing** | You've acknowledged the order / started fulfillment. |
| **Completed** | Delivered and done. |
| **Cancelled** | Cancelled by you or customer. |

### Fulfill an Order (COD)

1. Open the order.
2. Review items, delivery address, phone number.
3. Contact customer or dispatch to courier.
4. In Admin → order detail → **Fulfillment** section → click **Create Fulfillment**.
5. Select items, confirm.
6. When delivered: click **Mark as Shipped** (optional tracking number) → **Mark as Delivered**.
7. Order moves to Completed.

### Archive an Order

After an order is completed and you no longer need it in the active view:
- Open order → click `...` → **Archive**.

### Capture Payment (COD)

For COD orders, once delivered:
- Open order → **Payment** section → **Capture Payment**.
- This marks the payment as captured (cash received). Not mandatory for operations but useful for bookkeeping.

---

## 3. Managing Products

### Edit an Existing Product

1. Admin → **Products** → click the product.
2. Editable fields: title, description, thumbnail, images, status, tags.
3. Scroll down for **Variants** — edit price (in piasters; 149 EGP = 14900).
4. **Save changes** (top right button).

### Add a New Product

1. Admin → **Products** → **+ New product** (top right).
2. Fill in:
   - **Title** (Arabic + English recommended)
   - **Description**
   - **Thumbnail** — upload image from your computer
3. Scroll to **Variants** → add variant:
   - Title: `Default` or variant name (e.g. size, color)
   - Price: enter amount in piasters (1 EGP = 100 piasters; 149 EGP = 14900)
   - Currency: EGP
4. **Sales Channels**: make sure **Default Sales Channel** is selected.
5. **Status**: set to **Published** when ready.
6. Save.

> Tip: Always upload a real product photo. White background images work best with the Golden Noir design.

### Publish / Unpublish a Product

- Open product → status toggle (top of page): **Published** ↔ **Draft**.
- Draft = hidden from storefront. Published = visible to customers.

### Delete a Product

- Open product → `...` menu → **Delete**.
- Only delete if you are sure — no undo. Consider setting to **Draft** instead.

### Manage Inventory

Currently all products use `manage_inventory: false` (unlimited stock).
If you want to track stock:
1. Open product → Variant → enable **Manage Inventory**.
2. Set quantity.
3. It decrements automatically on each completed order.

---

## 4. Categories and Collections

### Categories (فئات)

Organized into 5 main categories + 20 sub-categories:

| Category | Arabic Name |
|---|---|
| Accessories | الإكسسوارات |
| Hair Accessories | توك وإكسسوارات الشعر |
| Makeup | المكياج |
| Perfumes | العطور |
| Gift Sets | الهدايا والبوكسات |

To add a product to a category:
- Open product → **Categories** section → search and add the relevant category.

### Collections (كولكشنات)

Collections are editorial groupings (e.g. seasonal, featured). Customers can browse them on the storefront.

Admin → **Collections** → open a collection → **Add products**.

---

## 5. Customers

Admin → **Customers** → view registered customer accounts.

- Click a customer to see their orders, address, email.
- You cannot process orders on behalf of customers from Admin; orders come through the storefront.

---

## 6. Pricing (EGP)

All prices are in **piasters** in the database (1 EGP = 100 piasters).

| Display Price | Enter in Admin |
|---|---|
| 99 EGP | 9900 |
| 149 EGP | 14900 |
| 199 EGP | 19900 |
| 499 EGP | 49900 |

---

## 7. Shipping Options

Currently configured:

| Option | Price |
|---|---|
| الشحن العادي (Standard) | 40 EGP |
| الشحن السريع (Express) | 80 EGP |

To change prices: Admin → **Settings** → **Regions** → Egypt → **Shipping Options** → click option → edit price.

---

## 8. Content Pages

The storefront has 5 static content pages. To update their text, you need to edit the source files in:

```
apps/storefront/src/app/[countryCode]/(main)/content/[slug]/page.tsx
```

Or ask your developer to update the text. Pages:

| Slug | URL |
|---|---|
| about | /eg/content/about |
| contact | /eg/content/contact |
| privacy-policy | /eg/content/privacy-policy |
| terms-of-use | /eg/content/terms-of-use |
| shipping-policy | /eg/content/shipping-policy |

---

## 9. Email Notifications (Order Alerts)

Currently disabled — waiting for Resend API key setup (Owner Action O2).

**To enable order email notifications:**

1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Verify your sending domain (e.g. asumastore.com)
3. Create an API key
4. In Railway dashboard → **asuma-backend** service → **Variables**:
   - Add `RESEND_API_KEY` = your key
   - Add `NOTIFICATION_FROM_EMAIL` = noreply@yourdomain.com
   - Add `NOTIFICATION_ADMIN_EMAIL` = your email address
5. Redeploy: `railway deployment up --service asuma-backend`

After this, you will receive an email for every new order, and the customer will receive an order confirmation.

---

## 10. Common Tasks Reference

### "I want to add a new product with a real photo"

1. Prepare image (JPG/PNG, recommended size: 1000×1000px or larger)
2. Admin → Products → New Product → upload thumbnail
3. Supabase stores images via the backend automatically
4. Set price, status: Published, assign to a category and sales channel

### "An order came in — what do I do?"

1. Admin → Orders → click the new order
2. Review items + address + phone
3. Package the order
4. Contact customer or send to courier
5. Create Fulfillment in Admin → Mark Shipped/Delivered when done

### "A customer wants to cancel their order"

1. Admin → Orders → open the order
2. Click `...` → **Cancel Order**
3. This voids it (no refund needed for COD as no payment was taken digitally)

### "A product should not be shown right now"

1. Admin → Products → click the product
2. Change status from **Published** → **Draft**
3. It disappears from the storefront immediately (no deploy needed)

---

## 11. Pre-Launch Checklist (Gate 12)

Before you go public/announce the store, complete these one-time security steps:

- [ ] Rotate JWT_SECRET (see RUNBOOKS.md RB-10, step 1)
- [ ] Rotate COOKIE_SECRET (RB-10, step 2)
- [ ] Rotate Redis password (RB-10, step 3)
- [ ] Rotate Supabase DB password (RB-10, step 4)
- [ ] Change admin password to a strong, new password (RB-10, step 5)
- [ ] Remove orphan environment variables: S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION, BUILD_TRIGGER_S3, MEDUSA_ADMIN_PASS from backend; BUILD_TRIGGER from storefront (RB-10, step 6)
- [ ] Set up Resend email notifications (Section 9 above — O2)
- [ ] Run final smoke test: `node scripts/smoke-test.js`

---

## 12. When Things Go Wrong

| Problem | Where to look |
|---|---|
| Site is down | RUNBOOKS.md → RB-8 (Incident Response) |
| Cart not working | RUNBOOKS.md → RB-4 (Redis Replacement) |
| Can't log in to Admin | RUNBOOKS.md → RB-5 (Admin Recovery) |
| Need to roll back a deploy | RUNBOOKS.md → RB-3 (Rollback) |
| Need to deploy manually | RUNBOOKS.md → RB-2 (Manual Deploy) |
| Database backup | RUNBOOKS.md → RB-6 (DB Backup) |

---

## 13. Infrastructure Overview (for reference)

| Component | Platform | Purpose |
|---|---|---|
| Backend API | Railway — asuma-backend service | Medusa 2.x (orders, products, customers, auth) |
| Storefront | Railway — asuma-storefront service | Next.js 15 (customer-facing site) |
| Database | Supabase PostgreSQL | All store data (products, orders, customers) |
| File Storage | Supabase Storage | Product images |
| Message Queue | Railway Redis | Internal job queue (BullMQ) |
| Email | Resend (pending O2) | Order notifications |

---

*Last updated: 2026-06-24*
*For developer-level docs: see `docs/MASTER_EXECUTION_PLAN.md`, `docs/RUNBOOKS.md`, `docs/EXECUTION_LOG.md`*
