import Link from "next/link";
import { Briefcase } from "lucide-react";
import { SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-2">
          <Briefcase className="size-4 text-primary" />
          {SITE.name} — trouvez votre prochain poste.
        </p>
        <nav className="flex gap-6">
          <Link href="/emplois" className="hover:text-foreground">
            Offres
          </Link>
          <Link href="/entreprises" className="hover:text-foreground">
            Entreprises
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Connexion
          </Link>
        </nav>
      </div>
    </footer>
  );
}
