"use client";

import { useTransition } from "react";
import { Suspense } from "react";
import { toast } from "sonner";
import { Mail, Phone, Paperclip } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/admin/data-table";
import { setApplicationStatus } from "@/lib/actions/applications";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Application } from "@/lib/generated/prisma/client";

export type ApplicationRow = Application & {
  job: { title: string; slug: string; company: { name: string } };
};

const STATUSES = ["NEW", "REVIEWED", "INTERVIEW", "REJECTED", "ACCEPTED"] as const;

function Table({ applications }: { applications: ApplicationRow[] }) {
  const [pending, startTransition] = useTransition();

  const columns: ColumnDef<ApplicationRow>[] = [
    {
      accessorKey: "name",
      header: "Candidat",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="size-3" /> {row.original.email}
            {row.original.phone && (
              <>
                <Phone className="size-3" /> {row.original.phone}
              </>
            )}
          </p>
        </div>
      ),
    },
    {
      id: "job",
      header: "Poste",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.job.title}
          <p className="text-xs text-muted-foreground">
            {row.original.job.company.name}
          </p>
        </div>
      ),
      accessorFn: (row) => row.job.title,
    },
    {
      id: "message",
      header: "Message",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {row.original.message ?? "—"}
          </p>
          {row.original.cvUrl && (
            <a
              href={row.original.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Paperclip className="size-3" /> CV
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "NEW"
              ? "secondary"
              : row.original.status === "REJECTED"
                ? "destructive"
                : row.original.status === "ACCEPTED"
                  ? "default"
                  : "outline"
          }
        >
          {APPLICATION_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Reçue le",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Select
            value={row.original.status}
            disabled={pending}
            onValueChange={(status) =>
              status &&
              startTransition(async () => {
                const r = await setApplicationStatus(
                  row.original.id,
                  status as (typeof STATUSES)[number],
                );
                if (r.ok) toast.success("Statut mis à jour");
                else toast.error(r.error);
              })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {APPLICATION_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      searchKey="name"
      searchPlaceholder="Rechercher un candidat…"
    />
  );
}

export function ApplicationsTable(props: { applications: ApplicationRow[] }) {
  return (
    <Suspense>
      <Table {...props} />
    </Suspense>
  );
}
