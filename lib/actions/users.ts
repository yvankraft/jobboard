"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth, requireUser } from "@/lib/auth";
import { profileSchema, passwordSchema } from "@/lib/validators";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: { name: string }): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide" };
    }
    await auth.api.updateUser({
      headers: await headers(),
      body: { name: parsed.data.name },
    });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  try {
    await requireUser();
    const parsed = passwordSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalide" };
    }
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur" };
  }
}

// ─── Admin : gestion des utilisateurs ───

export async function setUserRole(
  userId: string,
  role: "ADMIN" | "EMPLOYER" | "CANDIDATE",
): Promise<ActionResult> {
  const { requireAdmin } = await import("@/lib/auth");
  const admin = await requireAdmin();
  if (admin.id === userId && role !== "ADMIN")
    return { ok: false, error: "Vous ne pouvez pas retirer votre propre rôle admin" };
  const { db } = await import("@/lib/db");
  await db.user.update({ where: { id: userId }, data: { role } });
  const { logActivity } = await import("@/lib/activity");
  await logActivity("user.role", "user", userId, admin.id, `→ ${role}`);
  revalidatePath("/admin/users");
  return { ok: true };
}
