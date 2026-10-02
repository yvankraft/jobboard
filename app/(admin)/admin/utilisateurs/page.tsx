import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utilisateurs" };

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await db.user.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic">Utilisateurs</h1>
      <UsersTable users={users} meId={me.id} />
    </div>
  );
}
