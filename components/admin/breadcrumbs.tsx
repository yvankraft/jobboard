"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

const labels: Record<string, string> = {
  admin: "Admin",
  sections: "Sections",
  pages: "Pages",
  activity: "Activité",
  settings: "Paramètres",
  new: "Nouveau",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = labels[segment] ?? segment;
        const last = i === segments.length - 1;
        return (
          <Fragment key={href}>
            {i > 0 && <ChevronRight className="size-3.5" />}
            {last ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
