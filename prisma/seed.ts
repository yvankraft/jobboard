import "dotenv/config";
import { db } from "../lib/db";
import { auth } from "../lib/auth";

async function seed() {
  if ((await db.user.count()) === 0) {
    const mk = (email: string, name: string, role: string) =>
      auth.api
        .signUpEmail({ body: { email, name, password: "password123" } })
        .then(() => db.user.update({ where: { email }, data: { role } }));
    await mk("admin@example.com", "Admin", "ADMIN");
    await mk("sophie@example.com", "Sophie Marchand", "EMPLOYER");
    await mk("thomas@example.com", "Thomas Leroy", "EMPLOYER");
    await mk("lina@example.com", "Lina Dubois", "CANDIDATE");
    await mk("marc@example.com", "Marc Bernard", "CANDIDATE");
    console.log("5 users créés");
  }
  const [admin, sophie, thomas, lina, marc] = await Promise.all(
    ["admin@example.com", "sophie@example.com", "thomas@example.com",
     "lina@example.com", "marc@example.com"].map((e) =>
      db.user.findUniqueOrThrow({ where: { email: e } }),
    ),
  );

  if ((await db.category.count()) === 0) {
    for (const [slug, name] of [
      ["dev", "Développement"], ["design", "Design"], ["data", "Data"],
      ["product", "Product"], ["marketing", "Marketing"], ["devops", "DevOps"],
    ] as const)
      await db.category.create({ data: { slug, name } });
    console.log("6 catégories");
  }
  const cats = await db.category.findMany();
  const cat = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  if ((await db.company.count()) === 0) {
    await db.company.createMany({ data: [
      { slug: "nova-studio", name: "Nova Studio", description: "Studio produit indépendant — nous concevons des apps web et mobile pour des scale-ups.", location: "Paris", websiteUrl: "https://nova.example.com", ownerId: sophie.id },
      { slug: "datawave", name: "Datawave", description: "Plateforme d'analytics temps réel pour le retail.", location: "Lyon", websiteUrl: "https://datawave.example.com", ownerId: thomas.id },
      { slug: "ferrovia", name: "Ferrovia", description: "Logiciels de gestion pour le ferroviaire européen.", location: "Remote", ownerId: admin.id },
      { slug: "pixelforge", name: "PixelForge", description: "Agence créative spécialisée en 3D et motion.", location: "Bordeaux", ownerId: sophie.id },
    ]});
    console.log("4 entreprises");
  }
  const companies = await db.company.findMany();
  const co = Object.fromEntries(companies.map((c) => [c.slug, c.id]));

  if ((await db.job.count()) === 0) {
    const jobs = [
      { slug: "dev-fullstack-senior", title: "Développeur Full-Stack Senior", location: "Paris", contract: "CDI", remote: "HYBRID", salaryMin: 65000, salaryMax: 80000, status: "PUBLISHED", featured: true, companyId: co["nova-studio"], categoryId: cat.dev, publishedAt: new Date(Date.now() - 2 * 864e5), description: "<p>Nous cherchons un senior full-stack pour mener le développement de notre flagship SaaS.</p><h3>Stack</h3><ul><li>Next.js, React 19, TypeScript</li><li>PostgreSQL, Prisma</li><li>Node.js, Redis</li></ul><h3>Vous</h3><ul><li>5+ ans d'expérience produit</li><li>Autonomie et sens du craft</li></ul>" },
      { slug: "product-designer", title: "Product Designer", location: "Paris", contract: "CDI", remote: "HYBRID", salaryMin: 55000, salaryMax: 70000, status: "PUBLISHED", featured: true, companyId: co["nova-studio"], categoryId: cat.design, publishedAt: new Date(Date.now() - 4 * 864e5), description: "<p>Rejoignez notre équipe design (3 personnes) pour prendre la main sur le design system et la recherche utilisateur.</p>" },
      { slug: "data-engineer", title: "Data Engineer", location: "Lyon", contract: "CDI", remote: "ONSITE", salaryMin: 50000, salaryMax: 65000, status: "PUBLISHED", featured: false, companyId: co["datawave"], categoryId: cat.data, publishedAt: new Date(Date.now() - 864e5), description: "<p>Construisez les pipelines qui alimentent nos dashboards retail : Kafka, Spark, dbt.</p>" },
      { slug: "devops-junior", title: "DevOps Junior", location: "Remote", contract: "CDI", remote: "FULL_REMOTE", salaryMin: 38000, salaryMax: 45000, status: "PUBLISHED", featured: false, companyId: co["ferrovia"], categoryId: cat.devops, publishedAt: new Date(Date.now() - 3 * 864e5), description: "<p>Premier poste DevOps accepté : Kubernetes, Terraform, CI/CD GitHub Actions.</p>" },
      { slug: "motion-designer-freelance", title: "Motion Designer (freelance)", location: "Bordeaux", contract: "FREELANCE", remote: "HYBRID", salaryMin: null, salaryMax: null, status: "PUBLISHED", featured: false, companyId: co["pixelforge"], categoryId: cat.design, publishedAt: new Date(Date.now() - 5 * 864e5), description: "<p>Missions ponctuelles motion 3D — After Effects, Cinema 4D.</p>" },
      { slug: "stage-growth", title: "Stage Growth Marketing", location: "Paris", contract: "STAGE", remote: "ONSITE", salaryMin: null, salaryMax: null, status: "PUBLISHED", featured: false, companyId: co["nova-studio"], categoryId: cat.marketing, publishedAt: new Date(Date.now() - 6 * 864e5), description: "<p>Stage 6 mois : SEO, contenus, automatisation marketing.</p>" },
      { slug: "pm-senior", title: "Product Manager Senior", location: "Paris", contract: "CDI", remote: "HYBRID", salaryMin: 70000, salaryMax: 90000, status: "DRAFT", featured: false, companyId: co["nova-studio"], categoryId: cat.product, publishedAt: null, description: "<p>Brouillon en cours de rédaction.</p>" },
    ];
    for (const j of jobs) await db.job.create({ data: j as never });
    console.log("7 offres (6 publiées, 1 brouillon)");
  }

  if ((await db.application.count()) === 0) {
    const jobs = await db.job.findMany({ where: { status: "PUBLISHED" } });
    const j = Object.fromEntries(jobs.map((x) => [x.slug, x.id]));
    await db.application.createMany({ data: [
      { jobId: j["dev-fullstack-senior"], userId: lina.id, name: "Lina Dubois", email: "lina@example.com", phone: "0612345678", message: "5 ans d'expérience full-stack, fan de Next.js.", status: "INTERVIEW", createdAt: new Date(Date.now() - 864e5) },
      { jobId: j["dev-fullstack-senior"], userId: null, name: "Paul Martin", email: "paul.martin@mail.com", message: "Profil backend fort, envie de passer fullstack.", status: "NEW", createdAt: new Date(Date.now() - 5 * 36e5) },
      { jobId: j["data-engineer"], userId: marc.id, name: "Marc Bernard", email: "marc@example.com", cvUrl: "https://cv.example.com/marc.pdf", message: "Data engineer 3 ans, certifié Spark.", status: "REVIEWED", createdAt: new Date(Date.now() - 2 * 864e5) },
      { jobId: j["product-designer"], userId: lina.id, name: "Lina Dubois", email: "lina@example.com", message: "Design system + recherche UX, portfolio sur demande.", status: "NEW" },
      { jobId: j["devops-junior"], userId: null, name: "Sara Kim", email: "sara.kim@mail.com", message: "Sortie d'école, passionnée d'infra.", status: "ACCEPTED", createdAt: new Date(Date.now() - 8 * 864e5) },
      { jobId: j["motion-designer-freelance"], userId: null, name: "Alex Ray", email: "alex@motion.fr", cvUrl: "https://reel.example.com/alex", status: "REJECTED" },
    ]});
    console.log("6 candidatures");
  }

  await db.activityLog.create({
    data: { action: "seed.run", entity: "system", userId: admin.id, detail: "Base initialisée" },
  });
  console.log("Seed jobboard terminé. Login : admin@example.com / password123");
}

seed().finally(() => process.exit(0));
