"use client";

import { useTransition } from "react";
import { toast } from "sonner";
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
import { setUserRole } from "@/lib/actions/users";
import { formatDate } from "@/lib/format";
import type { User } from "@/lib/generated/prisma/client";

export type UserRow = User & {
  _count: { applications: number };
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  EMPLOYER: "Employeur",
  CANDIDATE: "Candidat",
};

export function UsersTable({ users, meId }: { users: UserRow[]; meId: string }) {
  const [pending, startTransition] = useTransition();

  const columns: ColumnDef<UserRow>[] = [
    {
      accessorKey: "name",
      header: "Utilisateur",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => (
        <Badge
          variant={row.original.role === "ADMIN" ? "default" : "secondary"}
        >
          {ROLE_LABELS[row.original.role] ?? row.original.role}
        </Badge>
      ),
    },
    {
      id: "activity",
      header: "Activité",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original._count.applications ?? 0} candidatures
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Inscrit le",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Select
            value={row.original.role}
            disabled={pending || row.original.id === meId}
            onValueChange={(role) =>
              role &&
              startTransition(async () => {
                const r = await setUserRole(
                  row.original.id,
                  role as "ADMIN" | "EMPLOYER" | "CANDIDATE",
                );
                if (r.ok) toast.success("Rôle mis à jour");
                else toast.error(r.error);
              })
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CANDIDATE">Candidat</SelectItem>
              <SelectItem value="EMPLOYER">Employeur</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey="name"
      searchPlaceholder="Rechercher un utilisateur…"
    />
  );
}
