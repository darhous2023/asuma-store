import { listCategories } from "@lib/data/categories"
import CategoryBarClient from "./client"

const DEMO_HANDLES = ["shirts", "sweatshirts", "pants", "merch"]

export default async function CategoryBar() {
  const categories = await listCategories()
  const main = (categories ?? [])
    .filter((c) => !c.parent_category && !DEMO_HANDLES.includes(c.handle ?? ""))
    .map((c) => ({ id: c.id, name: c.name, handle: c.handle }))

  if (main.length === 0) return null

  return <CategoryBarClient categories={main} />
}
