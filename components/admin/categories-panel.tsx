"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { upsertCategory, deleteCategory } from "@/lib/actions/jobs";
import { slugify } from "@/lib/slugify";
import type { Category } from "@/lib/generated/prisma/client";

type Row = Category & { _count: { jobs: number } };

export function CategoriesPanel({ categories }: { categories: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [del, setDel] = useState<Row | null>(null);

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const r = await upsertCategory({
        name: name.trim(),
        slug: slugify(name.trim()),
      });
      if (r.ok) {
        toast.success("Catégorie créée");
        setName("");
        router.refresh();
      } else toast.error(r.error);
    });
  }

  function rename(id: string, value: string) {
    startTransition(async () => {
      const r = await upsertCategory({ name: value, slug: slugify(value) }, id);
      if (!r.ok) toast.error(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex gap-2">
        <Input
          placeholder="Nouvelle catégorie…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" disabled={pending}>
          <Plus className="size-4" /> Ajouter
        </Button>
      </form>

      <Card>
        <CardContent className="divide-y p-0">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <Input
                className="max-w-xs border-transparent hover:border-input"
                defaultValue={c.name}
                onBlur={(e) => {
                  if (e.target.value !== c.name && e.target.value.trim())
                    rename(c.id, e.target.value.trim());
                }}
              />
              <span className="text-xs text-muted-foreground">/{c.slug}</span>
              <span className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {c._count.jobs} offres
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDel(c)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune catégorie.
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!del}
        onOpenChange={(o) => !o && setDel(null)}
        title={`Supprimer « ${del?.name} » ?`}
        description="Bloqué si des offres y sont rattachées."
        onConfirm={() =>
          startTransition(async () => {
            if (!del) return;
            const r = await deleteCategory(del.id);
            if (r.ok) {
              toast.success("Catégorie supprimée");
              setDel(null);
              router.refresh();
            } else toast.error(r.error);
          })
        }
      />
    </div>
  );
}
