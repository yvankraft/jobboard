import { Briefcase, Building2, FileText, Inbox } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStats } from "@/lib/queries";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getSessionUser();
  const isEmployer = user?.role === "EMPLOYER";
  const scope = isEmployer ? { job: { company: { ownerId: user!.id } } } : {};

  const [[jobs, applications, newApps, companies], recent] = await Promise.all([
    getStats(),
    db.application.findMany({
      where: scope,
      include: {
        job: { select: { title: true, company: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
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

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl italic">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Offres publiées" value={stats[0]} icon={Briefcase} />
        <StatCard title="Candidatures" value={stats[1]} icon={FileText} />
        <StatCard title="À traiter" value={stats[2]} icon={Inbox} />
        <StatCard title="Entreprises" value={stats[3]} icon={Building2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernières candidatures</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune candidature pour le moment.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.job.title} · {a.job.company.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {APPLICATION_STATUS_LABELS[a.status]}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(a.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
