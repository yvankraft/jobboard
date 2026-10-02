import { notFound } from "next/navigation";
import { MapPin, Building2, Star, Globe } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { ApplyForm } from "@/components/job/apply-form";
import { getJobBySlug } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { CONTRACT_LABELS, REMOTE_LABELS } from "@/lib/constants";
import { timeAgo, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  return {
    title: `${job.title} — ${job.company.name}`,
    description: `${job.location} · ${CONTRACT_LABELS[job.contract]} · ${REMOTE_LABELS[job.remote]}`,
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [job, user] = await Promise.all([getJobBySlug(slug), getSessionUser()]);
  if (!job || job.status !== "PUBLISHED") notFound();

  const salary =
    job.salaryMin && job.salaryMax
      ? `${formatPrice(job.salaryMin)} – ${formatPrice(job.salaryMax)} / an`
      : null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-center gap-2">
              {job.featured && (
                <Badge className="gap-1">
                  <Star className="size-3 fill-current" /> À la une
                </Badge>
              )}
              {job.category && (
                <Badge variant="secondary">{job.category.name}</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                publiée {timeAgo(job.publishedAt ?? job.createdAt)}
              </span>
            </div>
            <h1 className="mt-3 font-serif text-4xl italic">{job.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4" /> {job.company.name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {job.location}
              </span>
              <Badge variant="outline">{CONTRACT_LABELS[job.contract]}</Badge>
              <Badge variant="outline">{REMOTE_LABELS[job.remote]}</Badge>
              {salary && <span className="font-medium">{salary}</span>}
            </div>
            {job.description && (
              <div
                className="prose prose-sm mt-8 max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Postuler</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplyForm
                  jobId={job.id}
                  defaultName={user?.name}
                  defaultEmail={user?.email}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 text-sm">
                <p className="font-medium">{job.company.name}</p>
                {job.company.location && (
                  <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" /> {job.company.location}
                  </p>
                )}
                {job.company.description && (
                  <p className="mt-3 line-clamp-4 text-muted-foreground">
                    {job.company.description}
                  </p>
                )}
                {job.company.websiteUrl && (
                  <a
                    href={job.company.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Globe className="size-3.5" /> Site web
                  </a>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </FadeIn>
    </div>
  );
}
