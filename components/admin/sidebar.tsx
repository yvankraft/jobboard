"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  FileText,
  Folder,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/offres", label: "Offres", icon: Briefcase },
  { href: "/admin/candidatures", label: "Candidatures", icon: FileText },
  { href: "/admin/entreprises", label: "Entreprises", icon: Building2 },
  { href: "/admin/categories", label: "Catégories", icon: Folder },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/activity", label: "Activité", icon: History },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const items = navItems;

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={() =>
          authClient.signOut().then(() => {
            router.push("/login");
            router.refresh();
          })
        }
        className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-destructive"
      >
        <LogOut className="size-4" />
        Déconnexion
      </button>
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
      <div className="flex h-14 items-center border-b px-5">
        <Link href="/admin" className="font-serif text-lg italic">
          Jobwave
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <AdminNav />
      </div>
    </aside>
  );
}
