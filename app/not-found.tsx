import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-7xl italic">404</p>
      <p className="mt-4 text-muted-foreground">
        Cette page de documentation n’existe pas.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-8" })}>
        Retour à l’accueil
      </Link>
    </div>
  );
}
