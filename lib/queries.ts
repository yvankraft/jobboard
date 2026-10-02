import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

// ─── Public ───

export type JobFilters = {
  q?: string;
  categorie?: string;
  contrat?: string;
  remote?: string;
};

export function getJobs(filters: JobFilters = {}) {
  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { location: { contains: filters.q, mode: "insensitive" } },
      { company: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }
  if (filters.categorie) where.category = { slug: filters.categorie };
  if (filters.contrat)
    where.contract = filters.contrat as Prisma.JobWhereInput["contract"];
  if (filters.remote)
    where.remote = filters.remote as Prisma.JobWhereInput["remote"];

  return db.job.findMany({
    where,
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { applications: true } },
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
}

export function getJobBySlug(slug: string) {
  return db.job.findUnique({
    where: { slug },
    include: {
      company: true,
      category: true,
      _count: { select: { applications: true } },
    },
  });
}

export function getCategories() {
  return db.category.findMany({
    include: {
      _count: { select: { jobs: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { name: "asc" },
  });
}

export function getCompanies() {
  return db.company.findMany({
    include: {
      _count: { select: { jobs: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { name: "asc" },
  });
}

/** Candidatures d'un candidat : par userId OU par email (candidatures invité). */
export async function getMyApplications(userId: string, email: string) {
  return db.application.findMany({
    where: { OR: [{ userId }, { email }] },
    include: {
      job: {
        include: { company: { select: { name: true, slug: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Admin / employeur ───

export function getAdminJobs(userId?: string) {
  // userId défini = employeur → seulement ses entreprises
  return db.job.findMany({
    where: userId ? { company: { ownerId: userId } } : {},
    include: {
      company: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getAdminApplications(userId?: string) {
  return db.application.findMany({
    where: userId ? { job: { company: { ownerId: userId } } } : {},
    include: {
      job: { select: { title: true, slug: true, company: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getStats() {
  return Promise.all([
    db.job.count({ where: { status: "PUBLISHED" } }),
    db.application.count(),
    db.application.count({ where: { status: "NEW" } }),
    db.company.count(),
  ]);
}

export function getActivityLogs(take = 100) {
  return db.activityLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}
