import Link from "next/link";
import { Briefcase } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser, isStaff } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { SiteNav } from "./site-nav";

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Briefcase className="size-5 text-primary" />
          {SITE.name}
        </Link>
        <SiteNav
          isLoggedIn={!!user}
          isStaff={!!user && isStaff(user)}
        />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              href={isStaff(user) ? "/admin" : "/mes-candidatures"}
              className={buttonVariants({ size: "sm" })}
            >
              {isStaff(user) ? "Back-office" : "Mes candidatures"}
            </Link>
          ) : (
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
