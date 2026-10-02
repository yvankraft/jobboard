"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSessionUser, requireStaff } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";
import {
  applicationSchema,
  type ApplicationInput,
} from "@/lib/validators";

type Result = { ok: true } | { ok: false; error: string };

/** Candidature publique (invité ou connecté) — rate-limitée par IP. */
export async function apply(input: ApplicationInput): Promise<Result> {
  const hs = await headers();
  const ip = hs.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`apply:${ip}`, 5, 60_000))
    return { ok: false, error: "Trop de candidatures, réessayez plus tard" };

  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const job = await db.job.findUnique({
    where: { id: parsed.data.jobId },
    select: { status: true, title: true },
  });
  if (!job || job.status !== "PUBLISHED")
    return { ok: false, error: "Cette offre n'accepte plus de candidatures" };

  const user = await getSessionUser();
  // Un compte connecté ne postule pas deux fois à la même offre
  const dupWhere = user
    ? { jobId: parsed.data.jobId, userId: user.id }
    : { jobId: parsed.data.jobId, email: parsed.data.email };
  const dup = await db.application.findFirst({ where: dupWhere });
  if (dup) return { ok: false, error: "Candidature déjà envoyée" };

  await db.application.create({
    data: {
      jobId: parsed.data.jobId,
      userId: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      cvUrl: parsed.data.cvUrl || null,
      message: parsed.data.message || null,
    },
  });
  await logActivity(
    "application.create",
    "job",
    parsed.data.jobId,
    user?.id,
    `${parsed.data.name} → ${job.title}`,
  );
  return { ok: true };
}

/** Changement de statut d'une candidature (employeur propriétaire ou admin). */
export async function setApplicationStatus(
  id: string,
  status: "NEW" | "REVIEWED" | "INTERVIEW" | "REJECTED" | "ACCEPTED",
): Promise<Result> {
  const user = await requireStaff();
  const app = await db.application.findUnique({
    where: { id },
    select: { job: { select: { company: { select: { ownerId: true } } } } },
  });
  if (!app) return { ok: false, error: "Candidature introuvable" };
  if (user.role === "EMPLOYER" && app.job.company.ownerId !== user.id)
    return { ok: false, error: "Non autorisé" };

  await db.application.update({ where: { id }, data: { status } });
  await logActivity("application.status", "application", id, user.id, status);
  revalidatePath("/admin/candidatures");
  return { ok: true };
}
