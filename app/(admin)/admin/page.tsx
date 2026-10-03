import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  FileText,
  Inbox,
  MapPin,
} from "lucide-react";
import { Bars } from "@/components/admin/dash-charts";
import { Badge } from "@/components/ui/badge";
import { getStats } from "@/lib/queries";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { APPLICATION_STATUS_LABELS, CONTRACT_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

const DAY_MS = 86400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);

export const dynamic = "force-dynamic";

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "—";
  const fmt = (n: number) => `${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)} €`;
  return `${fmt((min ?? max)!)} €`;
}

export default async function AdminDashboard() {
  const user = await getSessionUser();
  const isEmployer = user?.role === "EMPLOYER";
  const scope = isEmployer ? { job: { company: { ownerId: user!.id } } } : {};
  const jobScope = isEmployer ? { company: { ownerId: user!.id } } : {};
  const companyScope = isEmployer ? { ownerId: user!.id } : {};

  const [[jobs, applications, newApps, companies], recent, apps14d, featuredJobs, coList] =
    await Promise.all([
      getStats(),
      db.application.findMany({
        where: scope,
        include: {
          job: { select: { title: true, company: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 7,
      }),
      db.application.findMany({
        where: { ...scope, createdAt: { gte: daysAgo(14) } },
        select: { createdAt: true },
      }),
      db.job.findMany({
        where: { ...jobScope, status: "PUBLISHED" },
        include: {
          company: { select: { name: true } },
          _count: { select: { applications: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
      db.company.findMany({
        where: companyScope,
        include: { _count: { select: { jobs: true } } },
        orderBy: { jobs: { _count: "desc" } },
        take: 5,
      }),
    ]);

  const stats = isEmployer
    ? await Promise.all([
      db.job.count({
        where: { status: "PUBLISHED", company: { ownerId: user!.id } },
      }),
      db.application.count({ where: scope }),
      db.application.count({ where: { ...scope, status: "NEW" } }),
      db.company.count({ where: { ownerId: user!.id } }),
    ])
    : [jobs, applications, newApps, companies];

  const treatedCount = stats[1] - stats[2];
  const treatedPct = stats[1] ? Math.round((treatedCount / stats[1]) * 100) : 0;

  const perDay = new Map<string, number>();
  for (let i = 13; i >= 0; i--)
    perDay.set(daysAgo(i).toISOString().slice(0, 10), 0);
  for (const a of apps14d) {
    const d = a.createdAt.toISOString().slice(0, 10);
    if (perDay.has(d)) perDay.set(d, perDay.get(d)! + 1);
  }
  const dayLabels = [...perDay.keys()].map((d) => d.slice(8));

  return (
    <div className="space-y-5">
      {/* Hero stats — style Aurex */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Offres publiées</p>
            <Briefcase className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
            {stats[0]}
          </p>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{
                width: `${stats[0] ? Math.min(100, (stats[0] / Math.max(1, stats[0] + 2)) * 100) : 0}%`,
              }}
            />
            <div className="h-full bg-primary/60" style={{ width: "8%" }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isEmployer ? "vos offres en ligne" : "annonces actives du site"}
          </p>
        </div>
        <div className="rounded-3xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Candidatures traitées</p>
            <Inbox className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
            {treatedPct}
            <span className="text-lg text-muted-foreground">%</span>
          </p>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${treatedPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stats[2]} en attente sur {stats[1]} candidature(s)
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.4fr)]">
        {/* Candidatures — bar chart */}
        <div className="rounded-3xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Candidatures</p>
            <Badge variant="secondary" className="rounded-full text-xs">
              14 j
            </Badge>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {apps14d.length}
          </p>
          <div className="mt-4">
            <Bars data={[...perDay.values()]} labels={dayLabels} height={120} />
          </div>
        </div>

        {/* Chiffres */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 rounded-3xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Candidatures</p>
              <FileText className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {stats[1]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">au total</p>
          </div>
          <div className="flex-1 rounded-3xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Entreprises</p>
              <Building2 className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {stats[3]}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isEmployer ? "vos vitrines" : "référencées"}
            </p>
          </div>
        </div>

        {/* Offres — property cards */}
        <div className="rounded-3xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Offres en ligne</p>
            <Link
              href="/admin/offres"
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              Tout voir <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {featuredJobs.map((j) => (
              <Link
                key={j.id}
                href={`/emplois/${j.slug}`}
                className="group overflow-hidden rounded-2xl border bg-background transition-shadow hover:shadow-md"
              >
                <div className="relative h-20 bg-gradient-to-br from-primary/80 via-primary/50 to-primary/25 p-2.5">
                  <Badge className="absolute right-2 top-2 border-white/30 bg-white/20 text-[10px] text-white backdrop-blur">
                    {CONTRACT_LABELS[j.contract] ?? j.contract}
                  </Badge>
                  {j.featured && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                      ★ Vedette
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold group-hover:text-primary">
                    {j.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {j.location}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="font-medium tabular-nums">
                      {formatSalary(j.salaryMin, j.salaryMax)}
                    </span>
                    <span className="text-muted-foreground">
                      {j._count.applications} cand.
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {featuredJobs.length === 0 && (
              <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">
                Aucune offre publiée.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Table candidatures + entreprises */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-3xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Dernières candidatures</p>
            <Link
              href="/admin/candidatures"
              className="flex items-center gap-1 text-xs font-medium text-primary"
            >
              Tout voir <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucune candidature pour le moment.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2.5 font-medium">Candidat</th>
                    <th className="pb-2.5 font-medium">Poste</th>
                    <th className="pb-2.5 font-medium">Entreprise</th>
                    <th className="pb-2.5 font-medium">Statut</th>
                    <th className="pb-2.5 text-right font-medium">Reçue</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                            {a.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{a.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {a.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[180px] truncate py-3 pr-4">
                        {a.job.title}
                      </td>
                      <td className="max-w-[140px] truncate py-3 pr-4 text-muted-foreground">
                        {a.job.company.name}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={a.status === "NEW" ? "default" : "secondary"}
                          className="rounded-full text-[10px]"
                        >
                          {APPLICATION_STATUS_LABELS[a.status] ?? a.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {formatDate(a.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Entreprises — panneau latéral façon "Map" */}
        <div className="rounded-3xl border bg-card p-5">
          <p className="text-sm font-medium">Entreprises</p>
          <ul className="mt-4 space-y-3">
            {coList.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/entreprises/${c.slug}`}
                  className="group flex items-center gap-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <Building2 className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium group-hover:text-primary">
                      {c.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {c._count.jobs} offre(s)
                    </span>
                  </span>
                  <ArrowUpRight className="size-3.5 text-muted-foreground" />
                </Link>
              </li>
            ))}
            {coList.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune entreprise.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
