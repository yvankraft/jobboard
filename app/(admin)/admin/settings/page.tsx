import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Paramètres</h1>
      <SettingsForm name={user.name} email={user.email} />
    </div>
  );
}
