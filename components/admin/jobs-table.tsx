"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, Trash2, XCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { JobDialog } from "@/components/admin/job-dialog";
import { setJobStatus, deleteJob } from "@/lib/actions/jobs";
import { JOB_STATUS_LABELS, CONTRACT_LABELS, REMOTE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Category, Company, Job } from "@/lib/generated/prisma/client";

export type JobRow = Job & {
  company: { name: string };
  category: { name: string } | null;
  _count: { applications: number };
};

export function JobsTable({
  jobs,
  companies,
  categories,
}: {
  jobs: JobRow[];
  companies: Pick<Company, "id" | "name">[];
  categories: Category[];
}) {
  const [pending, startTransition] = useTransition();
  const [del, setDel] = useState<JobRow | null>(null);

  const columns: ColumnDef<JobRow>[] = [
    {
      accessorKey: "title",
      header: "Offre",
      cell: ({ row }) => (
        <div>
          <Link
            href={`/emplois/${row.original.slug}`}
            className="font-medium hover:text-primary"
          >
            {row.original.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {row.original.company.name} · {row.original.location}
          </p>
        </div>
      ),
    },
    {
      id: "terms",
      header: "Contrat",
      cell: ({ row }) => (
        <div className="text-xs">
          <Badge variant="outline">{CONTRACT_LABELS[row.original.contract]}</Badge>{" "}
          <Badge variant="secondary">{REMOTE_LABELS[row.original.remote]}</Badge>
        </div>
      ),
    },
    {
      id: "apps",
      header: "Candidatures",
      cell: ({ row }) => (
        <Link
          href={`/admin/candidatures?job=${row.original.id}`}
          className="text-primary hover:underline"
        >
          {row.original._count.applications}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "PUBLISHED" ? "default" : "secondary"}
        >
          {JOB_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Créée le",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const j = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {j.status !== "PUBLISHED" ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const r = await setJobStatus(j.id, "PUBLISHED");
                    if (r.ok) toast.success("Offre publiée");
                    else toast.error(r.error);
                  })
                }
              >
                <Eye className="size-4" /> Publier
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const r = await setJobStatus(j.id, "CLOSED");
                    if (r.ok) toast.success("Offre clôturée");
                    else toast.error(r.error);
                  })
                }
              >
                <XCircle className="size-4" /> Clôturer
              </Button>
            )}
            <JobDialog job={j} companies={companies} categories={categories} />
            <Button
              variant="ghost"
              size="icon"
              disabled={pending}
              onClick={() => setDel(j)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={jobs}
        searchKey="title"
        searchPlaceholder="Rechercher une offre…"
      />
      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title={`Supprimer « ${del?.title} » ?`}
        description="Les candidatures associées seront également supprimées."
        onConfirm={() =>
          startTransition(async () => {
            if (!del) return;
            const r = await deleteJob(del.id);
            if (r.ok) {
              toast.success("Offre supprimée");
              setDel(null);
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}
