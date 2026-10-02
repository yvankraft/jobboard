import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(3, "Titre trop court").max(120),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug invalide"),
  description: z.string().default(""),
  location: z.string().min(2).max(120),
  contract: z
    .enum(["CDI", "CDD", "FREELANCE", "STAGE", "ALTERNANCE"])
    .default("CDI"),
  remote: z.enum(["ONSITE", "HYBRID", "FULL_REMOTE"]).default("ONSITE"),
  salaryMin: z.coerce.number().int().min(0).optional().nullable(),
  salaryMax: z.coerce.number().int().min(0).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  companyId: z.string().min(1, "Entreprise requise"),
});
export type JobInput = z.infer<typeof jobSchema>;

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  name: z.string().min(2, "Nom requis").max(80),
  email: z.string().email("Email invalide"),
  phone: z.string().max(20).optional().or(z.literal("")),
  cvUrl: z.string().url().optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;

export const companySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().default(""),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
});
export type CompanyInput = z.infer<typeof companySchema>;

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const profileSchema = z.object({
  name: z.string().min(2).max(60),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  })
  .strict();
export type PasswordInput = z.infer<typeof passwordSchema>;
