import type { Metadata } from "next";
import { JobCard } from "@/components/job/job-card";
import { JobFilters } from "@/components/job/job-filters";
import { FadeIn } from "@/components/motion/fade-in";
import { getJobs, getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Offres d'emploi",
  description: "Toutes les offres d'emploi publiées",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [jobs, categories] = await Promise.all([
    getJobs({
      q: sp.q,
      categorie: sp.categorie,
      contrat: sp.contrat,
      remote: sp.remote,
    }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <h1 className="font-serif text-4xl italic">Offres d&apos;emploi</h1>
        <p className="mt-2 text-muted-foreground">
          {jobs.length} offre{jobs.length > 1 ? "s" : ""} disponible
          {jobs.length > 1 ? "s" : ""}
        </p>
      </FadeIn>

      <div className="mt-6">
        <JobFilters
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </div>

      <div className="mt-8 grid gap-4">
        {jobs.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
      {jobs.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">
          Aucune offre ne correspond à ces critères.
        </p>
      )}
    </div>
  );
}
