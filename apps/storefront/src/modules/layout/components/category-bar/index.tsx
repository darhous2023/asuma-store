import { listCategories } from "@lib/data/categories"
import CategoryNavClient from "./client"
import { DEMO_CATEGORY_HANDLES } from "@config/storefront"

export default async function CategoryBar() {
  const categories = await listCategories()

  const main = (categories ?? [])
    .filter((c) => !c.parent_category && !DEMO_CATEGORY_HANDLES.includes(c.handle ?? ""))
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      children: (c.category_children ?? []).map((ch) => ({
        id: ch.id,
        name: ch.name,
        handle: ch.handle,
      })),
    }))

  if (main.length === 0) return null

  return <CategoryNavClient categories={main} />
}
