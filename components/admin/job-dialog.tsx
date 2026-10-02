"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertJob } from "@/lib/actions/jobs";
import { slugify } from "@/lib/slugify";
import type { Category, Company, Job } from "@/lib/generated/prisma/client";

type Props = {
  job?: Job;
  companies: Pick<Company, "id" | "name">[];
  categories: Category[];
};

export function JobDialog({ job, companies, categories }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const editing = !!job;
  const [contract, setContract] = useState(job?.contract ?? "CDI");
  const [remote, setRemote] = useState(job?.remote ?? "ONSITE");
  const [status, setStatus] = useState(job?.status ?? "DRAFT");
  const [companyId, setCompanyId] = useState(job?.companyId ?? "");
  const [categoryId, setCategoryId] = useState(job?.categoryId ?? "");
  const [featured, setFeatured] = useState(job?.featured ?? false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const input = {
      title: String(d.get("title")),
      slug: String(d.get("slug")),
      description: String(d.get("description") ?? ""),
      location: String(d.get("location")),
      contract: contract as "CDI",
      remote: remote as "ONSITE",
      salaryMin: Number(d.get("salaryMin")) || null,
      salaryMax: Number(d.get("salaryMax")) || null,
      status: status as "DRAFT",
      featured,
      categoryId: categoryId || null,
      companyId,
    };
    startTransition(async () => {
      const res = await upsertJob(input, job?.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(editing ? "Offre mise à jour" : "Offre créée");
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
              <Plus className="size-4" /> Nouvelle offre
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier l'offre" : "Nouvelle offre"}</DialogTitle>
          <DialogDescription>
            Une offre publiée apparaît immédiatement dans le catalogue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="j-title">Titre du poste</Label>
            <Input
              id="j-title"
              name="title"
              defaultValue={job?.title}
              required
              onChange={(e) => {
                if (!editing) {
                  const s = e.currentTarget.form?.elements.namedItem("slug");
                  if (s instanceof HTMLInputElement)
                    s.value = slugify(e.target.value);
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="j-slug">Slug</Label>
              <Input id="j-slug" name="slug" defaultValue={job?.slug} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="j-location">Lieu</Label>
              <Input
                id="j-location"
                name="location"
                defaultValue={job?.location}
                placeholder="Paris, Lyon, Remote…"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Select value={companyId} onValueChange={(v) => v && setCompanyId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Contrat</Label>
              <Select value={contract} onValueChange={(v) => v && setContract(v as typeof contract)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["CDI","CDD","FREELANCE","STAGE","ALTERNANCE"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remote</Label>
              <Select value={remote} onValueChange={(v) => v && setRemote(v as typeof remote)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONSITE">Sur site</SelectItem>
                  <SelectItem value="HYBRID">Hybride</SelectItem>
                  <SelectItem value="FULL_REMOTE">Full remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v as typeof status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="PUBLISHED">Publiée</SelectItem>
                  <SelectItem value="CLOSED">Clôturée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="j-smin">Salaire min (€/an)</Label>
              <Input id="j-smin" name="salaryMin" type="number" min="0" defaultValue={job?.salaryMin ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="j-smax">Salaire max (€/an)</Label>
              <Input id="j-smax" name="salaryMax" type="number" min="0" defaultValue={job?.salaryMax ?? ""} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={featured} onCheckedChange={setFeatured} id="j-feat" />
            <Label htmlFor="j-feat">Offre à la une</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="j-desc">Description (HTML)</Label>
            <Textarea id="j-desc" name="description" rows={6} defaultValue={job?.description} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enregistrement…" : editing ? "Enregistrer" : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
