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

  const { type, id } = await request.json();

  if (type === "subscription") {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    const daysToAdd = sub?.billingCycle === "YEARLY" ? 365 : 30;

    await prisma.subscription.update({
      where: { id },
      data: {
        paymentStatus: "CONFIRMED",
        status: "ACTIVE",
        isBlocked: false,
        reminderSentAt: null,
        expiresAt: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
      },
    });
  } else if (type === "featured") {
    await prisma.car.update({
      where: { id },
      data: { featuredPaymentStatus: "CONFIRMED", isFeatured: true },
    });
  }
await logActivity(`Confirmed ${type} payment`, type, id);
  return NextResponse.json({ success: true });
}
