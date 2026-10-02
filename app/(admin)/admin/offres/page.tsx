import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getAdminJobs, getCategories } from "@/lib/queries";
import { JobsTable } from "@/components/admin/jobs-table";
import { JobDialog } from "@/components/admin/job-dialog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Offres" };

export default async function JobsAdminPage() {
  const user = await getSessionUser();
  const isEmployer = user?.role === "EMPLOYER";
  const [jobs, categories, companies] = await Promise.all([
    getAdminJobs(isEmployer ? user!.id : undefined),
    getCategories(),
    db.company.findMany({
      where: isEmployer ? { ownerId: user!.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl italic">Offres</h1>
        <JobDialog companies={companies} categories={categories} />
      </div>
      <JobsTable jobs={jobs} companies={companies} categories={categories} />
    </div>
  );
}
