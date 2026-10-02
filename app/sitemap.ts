import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { getJobs } from "@/lib/queries";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, companies] = await Promise.all([
    getJobs(),
    db.company.findMany({ select: { slug: true, updatedAt: true } }),
  ]);
  const statics = ["", "/emplois", "/entreprises", "/login", "/register"].map(
    (p) => ({ url: `${SITE.url}${p}`, lastModified: new Date() }),
  );
  return [
    ...statics,
    ...jobs.map((j) => ({
      url: `${SITE.url}/emplois/${j.slug}`,
      lastModified: j.updatedAt,
    })),
    ...companies.map((c) => ({
      url: `${SITE.url}/entreprises/${c.slug}`,
      lastModified: c.updatedAt,
    })),
  ];
}
