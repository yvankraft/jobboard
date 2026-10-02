"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={() =>
        authClient.signOut().then(() => {
          router.push("/");
          router.refresh();
        })
      }
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive"
    >
      <LogOut className="size-4" /> Se déconnecter
    </button>
  );
}
