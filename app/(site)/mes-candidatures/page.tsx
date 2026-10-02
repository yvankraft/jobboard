import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { buttonVariants } from "@/components/ui/button";
import { getMyApplications } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mes candidatures",
  robots: { index: false },
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  NEW: "secondary",
  REVIEWED: "outline",
  INTERVIEW: "default",
  REJECTED: "destructive",
  ACCEPTED: "default",
};

export default async function MyApplicationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/mes-candidatures");
  const applications = await getMyApplications(user.id, user.email);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <FadeIn>
        <h1 className="font-serif text-4xl italic">Mes candidatures</h1>
        <p className="mt-2 text-muted-foreground">
          Suivi de vos {applications.length} candidature
          {applications.length > 1 ? "s" : ""}
        </p>
      </FadeIn>

      {applications.length === 0 ? (
        <Card className="mt-10">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">
              Aucune candidature pour le moment.
            </p>
            <Link href="/emplois" className={buttonVariants()}>
              Voir les offres
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {applications.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div>
                  <Link
                    href={`/emplois/${a.job.slug}`}
                    className="font-semibold hover:text-primary"
                  >
                    {a.job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {a.job.company.name} · envoyée le{" "}
                    {formatDate(a.createdAt)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[a.status] ?? "secondary"}>
                  {APPLICATION_STATUS_LABELS[a.status]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
