"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { upsertCompany, deleteCompany } from "@/lib/actions/companies";
import { slugify } from "@/lib/slugify";
import type { Company } from "@/lib/generated/prisma/client";

type Row = Company & { _count: { jobs: number } };

export function CompaniesPanel({
  companies,
  isAdmin,
}: {
  companies: Row[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [del, setDel] = useState<Row | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <CompanyDialog />
      <div className="grid gap-4 sm:grid-cols-2">
        {companies.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{c.slug} · {c._count.jobs} offre{c._count.jobs > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <CompanyDialog company={c} />
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pending}
                      onClick={() => setDel(c)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              {c.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {c.description}
                </p>
              )}
              {c.location && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {c.location}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title={`Supprimer « ${del?.name} » ?`}
        description="Bloqué si des offres y sont rattachées."
        onConfirm={() =>
          startTransition(async () => {
            if (!del) return;
            const r = await deleteCompany(del.id);
            if (r.ok) {
              toast.success("Entreprise supprimée");
              setDel(null);
              router.refresh();
            } else toast.error(r.error);
          })
        }
      />
    </div>
  );
}

function CompanyDialog({ company }: { company?: Row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!company;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await upsertCompany(
        {
          name: String(d.get("name")),
          slug: String(d.get("slug")),
          description: String(d.get("description") ?? ""),
          logoUrl: String(d.get("logoUrl") ?? ""),
          websiteUrl: String(d.get("websiteUrl") ?? ""),
          location: String(d.get("location") ?? ""),
        },
        company?.id,
      );
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(editing ? "Entreprise mise à jour" : "Entreprise créée");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button variant="ghost" size="sm">
              Modifier
            </Button>
          ) : (
            <Button size="sm">
              <Plus className="size-4" /> Nouvelle entreprise
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier l'entreprise" : "Nouvelle entreprise"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-name">Nom</Label>
              <Input
                id="c-name"
                name="name"
                defaultValue={company?.name}
                required
                onChange={(e) => {
                  if (!editing) {
                    const s =
                      e.currentTarget.form?.elements.namedItem("slug");
                    if (s instanceof HTMLInputElement)
                      s.value = slugify(e.target.value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-slug">Slug</Label>
              <Input
                id="c-slug"
                name="slug"
                defaultValue={company?.slug}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="c-loc">Localisation</Label>
              <Input
                id="c-loc"
                name="location"
                defaultValue={company?.location ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-web">Site web</Label>
              <Input
                id="c-web"
                name="websiteUrl"
                type="url"
                defaultValue={company?.websiteUrl ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-logo">Logo (URL)</Label>
            <Input
              id="c-logo"
              name="logoUrl"
              type="url"
              defaultValue={company?.logoUrl ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              name="description"
              rows={3}
              defaultValue={company?.description}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
