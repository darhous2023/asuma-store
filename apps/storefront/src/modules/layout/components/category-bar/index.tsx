import { listCategories } from "@lib/data/categories"
import CategoryBarClient from "./client"

export default async function CategoryBar() {
  const categories = await listCategories()
  const main = (categories ?? [])
    .filter((c) => !c.parent_category)
    .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))

  if (main.length === 0) return null

  return <CategoryBarClient categories={main} />
}
