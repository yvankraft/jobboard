"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apply } from "@/lib/actions/applications";

export function ApplyForm({
  jobId,
  defaultName,
  defaultEmail,
}: {
  jobId: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <p className="font-medium">Candidature envoyée !</p>
        <p className="text-sm text-muted-foreground">
          L&apos;entreprise vous recontactera par email. Suivez son statut dans
          « Mes candidatures » si vous avez un compte.
        </p>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await apply({
        jobId,
        name: String(d.get("name")),
        email: String(d.get("email")),
        phone: String(d.get("phone") ?? ""),
        cvUrl: String(d.get("cvUrl") ?? ""),
        message: String(d.get("message") ?? ""),
      });
      if (r.ok) setSent(true);
      else toast.error(r.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="a-name">Nom complet</Label>
          <Input
            id="a-name"
            name="name"
            defaultValue={defaultName}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-email">Email</Label>
          <Input
            id="a-email"
            name="email"
            type="email"
            defaultValue={defaultEmail}
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="a-phone">Téléphone</Label>
          <Input id="a-phone" name="phone" type="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-cv">Lien CV (optionnel)</Label>
          <Input
            id="a-cv"
            name="cvUrl"
            type="url"
            placeholder="https://…"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="a-msg">Message de motivation</Label>
        <Textarea
          id="a-msg"
          name="message"
          rows={4}
          placeholder="Quelques lignes sur vous et pourquoi ce poste…"
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer ma candidature"}
      </Button>
    </form>
  );
}
