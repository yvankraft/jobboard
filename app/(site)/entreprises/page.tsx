import type { Metadata } from "next";
import Link from "next/link";
import { Building2, MapPin, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { getCompanies } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entreprises" };

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <h1 className="font-serif text-4xl italic">Entreprises</h1>
        <p className="mt-2 text-muted-foreground">
          {companies.length} entreprises recrutent sur {`Jobwave`}
        </p>
      </FadeIn>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <Link key={c.id} href={`/entreprises/${c.slug}`} className="h-full">
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center overflow-hidden rounded-lg bg-muted font-semibold">
                    {c.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <Building2 className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c._count.jobs} offre{c._count.jobs > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {c.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {c.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {c.location}
                    </span>
                  )}
                  {c.websiteUrl && (
                    <a
                      href={c.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="size-3" /> Site
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
