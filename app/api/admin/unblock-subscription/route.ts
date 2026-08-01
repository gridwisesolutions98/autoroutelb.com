import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activityLog";
import { isValidAdminSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidAdminSessionToken(cookieStore.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { subscriptionId } = await request.json();

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { isBlocked: false },
  });
await logActivity("Removed block", "Subscription", subscriptionId);
  return NextResponse.json({ success: true });
}