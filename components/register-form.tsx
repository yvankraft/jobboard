"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirm"))) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setError("8 caractères minimum");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: String(data.get("name")),
      email: String(data.get("email")),
      password,
    });
    setLoading(false);

    if (error) {
      setError(
        error.code === "USER_ALREADY_EXISTS"
          ? "Cet email est déjà utilisé"
          : "Inscription impossible",
      );
      return;
    }
    router.push("/mes-candidatures");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmer le mot de passe</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Créer mon compte
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-foreground underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
