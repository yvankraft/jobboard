import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Globe } from "lucide-react";
import { db } from "@/lib/db";
import { JobCard } from "@/components/job/job-card";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await db.company.findUnique({ where: { slug } });
  if (!company) return {};
  return {
    title: `${company.name} — Offres d'emploi`,
    description: company.description ?? undefined,
    alternates: { canonical: `${SITE.url}/entreprises/${company.slug}` },
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = await db.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { status: "PUBLISHED" },
        include: { company: true, category: true },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/entreprises"
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← Toutes les entreprises
      </Link>
      <div className="mt-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl italic">{company.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {company.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-4" /> {company.location}
              </span>
            )}
            {company.websiteUrl && (
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <Globe className="size-4" /> Site web
              </a>
            )}
          </div>
        </div>
      </div>
      {company.description && (
        <p className="mt-6 text-muted-foreground">{company.description}</p>
      )}
      <h2 className="mt-10 font-serif text-2xl italic">
        {company.jobs.length} offre{company.jobs.length > 1 ? "s" : ""} ouverte
        {company.jobs.length > 1 ? "s" : ""}
      </h2>
      <div className="mt-6 space-y-4">
        {company.jobs.length === 0 ? (
          <p className="text-muted-foreground">
            Aucune offre publiée pour le moment.
          </p>
        ) : (
          company.jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
