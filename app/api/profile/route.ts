import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const { logoUrl, description, phoneNumber, workingHours, whishNumber, omtNumber, couponCode, couponPercent } = body;

  if (couponCode && !couponPercent) {
    return NextResponse.json({ error: "Set a discount percentage for the coupon code" }, { status: 400 });
  }

  if (couponPercent !== undefined && couponPercent !== null && couponPercent !== "") {
    const pct = parseInt(couponPercent);
    if (Number.isNaN(pct) || pct < 1 || pct > 100) {
      return NextResponse.json({ error: "Coupon discount must be between 1 and 100" }, { status: 400 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(logoUrl !== undefined && { logoUrl }),
      ...(description !== undefined && { description }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(workingHours !== undefined && { workingHours }),
      ...(whishNumber !== undefined && { whishNumber }),
      ...(omtNumber !== undefined && { omtNumber }),
      ...(couponCode !== undefined && { couponCode: couponCode || null }),
      ...(couponPercent !== undefined && { couponPercent: couponPercent ? parseInt(couponPercent) : null }),
    },
  });

  const { password: _pw, ...safeUser } = updated;
  return NextResponse.json({ success: true, user: safeUser });
}
