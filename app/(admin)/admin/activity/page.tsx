import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivityLogs } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Activité" };

export default async function ActivityPage() {
  const logs = await getActivityLogs(100);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Activité</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journal</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune activité.</p>
          ) : (
            <ul className="divide-y text-sm">
              {logs.map((l) => (
                <li key={l.id} className="flex items-baseline justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <span className="font-medium">{l.action}</span>{" "}
                    <span className="text-muted-foreground">{l.entity}</span>
                    {l.detail && (
                      <span className="text-muted-foreground"> — {l.detail}</span>
                    )}
                    <span className="block text-xs text-muted-foreground">
                      {l.user?.name ?? l.user?.email ?? "système"}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(l.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
