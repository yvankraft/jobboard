import { db } from "@/lib/db";

export async function logActivity(
  action: string,
  entity: string,
  entityId?: string,
  detail?: string,
  userId?: string,
) {
  try {
    await db.activityLog.create({
      data: { action, entity, entityId, detail, userId },
    });
  } catch {
    // Le logging ne doit jamais faire échouer une mutation
  }
}
