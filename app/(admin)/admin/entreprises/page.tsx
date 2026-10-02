import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { CompaniesPanel } from "@/components/admin/companies-panel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entreprises" };

export default async function CompaniesAdminPage() {
  const user = await getSessionUser();
  const isEmployer = user?.role === "EMPLOYER";
  const companies = await db.company.findMany({
    where: isEmployer ? { ownerId: user!.id } : {},
    include: { _count: { select: { jobs: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Entreprises</h1>
      <CompaniesPanel companies={companies} isAdmin={user?.role === "ADMIN"} />
    </div>
  );
}
