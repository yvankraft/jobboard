# Jobwave — Job Board

Squelette Next.js de site d'annonces emploi : offres publiées, candidatures en ligne, espace employeur et back-office admin. Thème **ambre**.

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4 + shadcn/ui (Base UI)
- Prisma 7 + PostgreSQL (`@prisma/adapter-pg`)
- Better Auth (email/password) — rôles `ADMIN` / `EMPLOYER` / `CANDIDATE`
- TanStack Table (admin), React Hook Form + Zod, Resend optionnel

## Fonctionnalités

**Public**
- Offres publiées : recherche plein-texte, filtres contrat / remote / catégorie, tri récentes
- Fiche offre : description riche, bouton « Postuler » (formulaire : nom, email, téléphone, CV URL, message)
- Annuaire entreprises + page entreprise (offres ouvertes)
- Candidat sans compte : la candidature est rattachée à l'email ; en se créant un compte avec le même email, l'historique est repris

**Candidat connecté** (`/mes-candidatures`)
- Liste de ses candidatures avec statut (Nouvelle → Vue → Entretien → Acceptée/Refusée)

**Employeur** (`/admin`)
- Dashboard stats, CRUD de **ses** offres et entreprises, candidatures à **ses** offres, changement de statut
- Ne voit pas les données des autres entreprises (filtrage `ownerId`/`company.ownerId`)

**Admin**
- Tout l'espace employeur en global + catégories, utilisateurs (changement de rôle), activité, paramètres

## Démarrage

```bash
pnpm install
cp .env.example .env          # DATABASE_URL, BETTER_AUTH_SECRET…
pnpm db:push && pnpm db:seed
pnpm dev                      # http://localhost:3000
```

Comptes de démo (`password123`) : `admin@example.com` · `sophie@example.com` (employeur Nova+PixelForge) · `thomas@example.com` (employeur Datawave) · `lina@example.com` (candidate).

## Scripts

`pnpm dev` · `build` · `typecheck` · `lint` · `db:generate` · `db:push` · `db:seed` · `db:studio`

## Structure

```
app/(site)/        # public : /, /emplois, /emplois/[slug], /entreprises, /mes-candidatures
app/(admin)/admin/ # back-office (employeur + admin)
lib/actions/       # server actions : jobs, applications, companies, users
lib/queries.ts     # lectures prisma
prisma/            # schéma + seed
```
