"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTRACT_LABELS, REMOTE_LABELS } from "@/lib/constants";

function FiltersInner({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function apply(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`/emplois?${next.toString()}`));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply("q", q || null);
      }}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Poste, entreprise, ville…"
          className="pl-9"
        />
      </div>
      <Select
        value={params.get("categorie") ?? ""}
        onValueChange={(v) => apply("categorie", v)}
      >
        <SelectTrigger className="sm:w-44">
          <SelectValue placeholder="Catégorie" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={params.get("contrat") ?? ""}
        onValueChange={(v) => apply("contrat", v)}
      >
        <SelectTrigger className="sm:w-36">
          <SelectValue placeholder="Contrat" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CONTRACT_LABELS).map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={params.get("remote") ?? ""}
        onValueChange={(v) => apply("remote", v)}
      >
        <SelectTrigger className="sm:w-36">
          <SelectValue placeholder="Remote" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(REMOTE_LABELS).map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit">Rechercher</Button>
    </form>
  );
}

export function JobFilters(props: {
  categories: { slug: string; name: string }[];
}) {
  return (
    <Suspense>
      <FiltersInner {...props} />
    </Suspense>
  );
}
