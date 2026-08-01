import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { transactionRef, plan, billingCycle, paymentMethod } = await request.json();

  await prisma.subscription.update({
    where: { userId },
    data: {
      transactionRef,
      plan,
      billingCycle,
      ...(paymentMethod === "WHISH" || paymentMethod === "OMT" ? { paymentMethod } : {}),
    },
  });

  return NextResponse.json({ success: true });
}
