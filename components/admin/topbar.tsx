"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminNav } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export function AdminTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 bg-sidebar">
            <SheetTitle className="sr-only">Navigation admin</SheetTitle>
            <div className="mt-6 flex h-full flex-col">
              <AdminNav onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <AdminBreadcrumbs />
      </div>
      <ThemeToggle />
    </div>
  );
}
