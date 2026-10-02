"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { companySchema, type CompanyInput } from "@/lib/validators";

type Result = { ok: true } | { ok: false; error: string };

async function canEditCompany(id: string) {
  const user = await requireStaff();
  if (user.role === "ADMIN") return user;
  const c = await db.company.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!c || c.ownerId !== user.id) return null;
  return user;
}

export async function upsertCompany(
  input: CompanyInput,
  id?: string,
): Promise<Result> {
  const user = await requireStaff();
  const parsed = companySchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  const data = {
    ...parsed.data,
    logoUrl: parsed.data.logoUrl || null,
    websiteUrl: parsed.data.websiteUrl || null,
    location: parsed.data.location || null,
  };
  if (id) {
    if (!(await canEditCompany(id)))
      return { ok: false, error: "Non autorisé" };
    await db.company.update({ where: { id }, data });
    await logActivity("company.update", "company", id, user.id);
  } else {
    const exists = await db.company.findUnique({
      where: { slug: data.slug },
    });
    if (exists) return { ok: false, error: "Slug déjà pris" };
    // Un employeur devient owner de l'entreprise qu'il crée
    const ownerId = user.role === "EMPLOYER" ? user.id : null;
    await db.company.create({ data: { ...data, ownerId } });
    await logActivity("company.create", "company", undefined, user.id, data.name);
  }
  revalidatePath("/admin/entreprises");
  return { ok: true };
}

export async function deleteCompany(id: string): Promise<Result> {
  const user = await requireAdmin();
  const n = await db.job.count({ where: { companyId: id } });
  if (n > 0)
    return { ok: false, error: `${n} offre(s) rattachée(s) — supprimez-les d'abord` };
  await db.company.delete({ where: { id } });
  await logActivity("company.delete", "company", id, user.id);
  revalidatePath("/admin/entreprises");
  return { ok: true };
}
