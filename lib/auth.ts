import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export type Role = "ADMIN" | "EMPLOYER" | "CANDIDATE";

export const auth = betterAuth({
  // Dev : accepte tous les ports localhost (next dev bascule si 3000 est occupé)
  trustedOrigins: ["http://localhost:*", "http://127.0.0.1:*"],
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CANDIDATE",
        input: false,
      },
    },
  },
});

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "EMPLOYER") redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

export function isAdmin(user: { role: string }) {
  return user.role === "ADMIN";
}

export function isEmployer(user: { role: string }) {
  return user.role === "EMPLOYER";
}

export function isStaff(user: { role: string }) {
  return user.role === "ADMIN" || user.role === "EMPLOYER";
}
