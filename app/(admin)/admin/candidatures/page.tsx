import { getSessionUser } from "@/lib/auth";
import { getAdminApplications } from "@/lib/queries";
import { ApplicationsTable } from "@/components/admin/applications-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Candidatures" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job } = await searchParams;
  const user = await getSessionUser();
  const isEmployer = user?.role === "EMPLOYER";
  let applications = await getAdminApplications(
    isEmployer ? user!.id : undefined,
  );
  if (job) applications = applications.filter((a) => a.jobId === job);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Candidatures</h1>
      <ApplicationsTable applications={applications} />
    </div>
  );
}
