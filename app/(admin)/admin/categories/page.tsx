import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CategoriesPanel } from "@/components/admin/categories-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catégories" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    include: { _count: { select: { jobs: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Catégories</h1>
      <CategoriesPanel categories={categories} />
    </div>
  );
}
