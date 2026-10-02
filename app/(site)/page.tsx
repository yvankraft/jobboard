import Link from "next/link";
import { Briefcase, Building2, Search, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { JobCard } from "@/components/job/job-card";
import { getJobs, getCategories, getCompanies } from "@/lib/queries";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [jobs, categories, companies] = await Promise.all([
    getJobs(),
    getCategories(),
    getCompanies(),
  ]);
  const featured = jobs.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-24 text-center">
        <FadeIn>
          <Briefcase className="mx-auto size-12 text-primary" />
          <h1 className="mt-6 font-serif text-5xl italic md:text-6xl">
            {SITE.name}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link href="/emplois" className={buttonVariants({ size: "lg" })}>
              <Search className="size-4" /> Voir les offres
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Créer un compte
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            {jobs.length} offres · {companies.length} entreprises
          </p>
        </FadeIn>
      </section>

      <FadeIn delay={0.1}>
        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Zap, title: "Candidature express", desc: "Nom, email, message — envoyé en 2 minutes." },
            { icon: Building2, title: "Entreprises vérifiées", desc: "Chaque annonceur est validé par notre équipe." },
            { icon: Search, title: "Suivi en ligne", desc: "Un compte candidat pour suivre vos candidatures." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border p-6">
              <f.icon className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </FadeIn>

      <section className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl italic">Dernières offres</h2>
          <Link href="/emplois" className="text-sm text-primary hover:underline">
            Toutes les offres →
          </Link>
        </div>
        <div className="mt-6 grid gap-4">
          {featured.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-3xl italic">Par catégorie</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/emplois?categorie=${c.slug}`}
              className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              {c.name}{" "}
              <span className="text-muted-foreground">({c._count.jobs})</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
