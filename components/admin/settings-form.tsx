"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, updateProfile } from "@/lib/actions/users";

export function SettingsForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [pendingProfile, setPendingProfile] = useState(false);
  const [pendingPassword, setPendingPassword] = useState(false);

  async function onProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPendingProfile(true);
    const res = await updateProfile({
      name: String(new FormData(e.currentTarget).get("name")),
    });
    setPendingProfile(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Profil mis à jour");
    router.refresh();
  }

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const newPassword = String(d.get("newPassword"));
    if (newPassword !== d.get("confirmPassword")) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setPendingPassword(true);
    const res = await changePassword({
      currentPassword: String(d.get("currentPassword")),
      newPassword,
    });
    setPendingPassword(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Mot de passe modifié");
    e.currentTarget.reset();
  }

  return (
    <div className="grid max-w-3xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
          <CardDescription>
            Votre nom public ({email}). L&apos;email n&apos;est pas modifiable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onProfile} className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                defaultValue={name}
                required
                minLength={2}
              />
            </div>
            <Button type="submit" disabled={pendingProfile}>
              {pendingProfile && <Loader2 className="size-4 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mot de passe</CardTitle>
          <CardDescription>
            La modification révoque vos autres sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmation</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={pendingPassword}>
              {pendingPassword && <Loader2 className="size-4 animate-spin" />}
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
