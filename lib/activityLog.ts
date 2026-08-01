import { prisma } from "@/lib/prisma";

export async function logActivity(action: string, targetType: string, targetId: string, details?: string) {
  try {
    await prisma.activityLog.create({
      data: { action, targetType, targetId, details },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}