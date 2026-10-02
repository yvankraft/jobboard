"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin, getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { jobSchema, categorySchema, type JobInput, type CategoryInput } from "@/lib/validators";

type Result = { ok: true } | { ok: false; error: string };

/** L'employeur ne touche que les offres de SES entreprises. */
async function canEditJob(jobId: string) {
  const user = await requireStaff();
  if (user.role === "ADMIN") return user;
  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { company: { select: { ownerId: true } } },
  });
  if (!job || job.company.ownerId !== user.id) return null;
  return user;
}

export async function upsertJob(input: JobInput, id?: string): Promise<Result> {
  const user = await requireStaff();
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  const data = {
    ...parsed.data,
    salaryMin: parsed.data.salaryMin ?? null,
    salaryMax: parsed.data.salaryMax ?? null,
    categoryId: parsed.data.categoryId || null,
  };

  // Employeur : l'entreprise choisie doit être la sienne
  if (user.role === "EMPLOYER") {
    const company = await db.company.findUnique({
      where: { id: data.companyId },
      select: { ownerId: true },
    });
    if (!company || company.ownerId !== user.id)
      return { ok: false, error: "Entreprise non autorisée" };
  }

  if (id) {
    if (!(await canEditJob(id))) return { ok: false, error: "Non autorisé" };
    const publishedAt =
      data.status === "PUBLISHED"
        ? (await db.job.findUnique({ where: { id }, select: { publishedAt: true } }))
            ?.publishedAt ?? new Date()
        : null;
    await db.job.update({ where: { id }, data: { ...data, publishedAt } });
    await logActivity("job.update", "job", id, user.id);
  } else {
    const exists = await db.job.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (exists) return { ok: false, error: "Ce slug est déjà pris" };
    const job = await db.job.create({
      data: {
        ...data,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    await logActivity("job.create", "job", job.id, user.id, data.title);
  }
  revalidatePath("/admin/offres");
  revalidatePath("/emplois");
  return { ok: true };
}

export async function setJobStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "CLOSED",
): Promise<Result> {
  const user = await canEditJob(id);
  if (!user) return { ok: false, error: "Non autorisé" };
  await db.job.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    },
  });
  await logActivity(`job.${status.toLowerCase()}`, "job", id, user.id);
  revalidatePath("/admin/offres");
  revalidatePath("/emplois");
  return { ok: true };
}

export async function deleteJob(id: string): Promise<Result> {
  const user = await canEditJob(id);
  if (!user) return { ok: false, error: "Non autorisé" };
  await db.job.delete({ where: { id } });
  await logActivity("job.delete", "job", id, user.id);
  revalidatePath("/admin/offres");
  return { ok: true };
}

// ─── Catégories (admin) ───

export async function upsertCategory(
  input: CategoryInput,
  id?: string,
): Promise<Result> {
  const user = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  if (id) {
    await db.category.update({ where: { id }, data: parsed.data });
  } else {
    const exists = await db.category.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (exists) return { ok: false, error: "Slug déjà pris" };
    await db.category.create({ data: parsed.data });
  }
  await logActivity("category.upsert", "category", id, user.id);
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const user = await requireAdmin();
  const n = await db.job.count({ where: { categoryId: id } });
  if (n > 0)
    return { ok: false, error: `${n} offre(s) rattachée(s)` };
  await db.category.delete({ where: { id } });
  await logActivity("category.delete", "category", id, user.id);
  revalidatePath("/admin/categories");
  return { ok: true };
}

export { getSessionUser };
