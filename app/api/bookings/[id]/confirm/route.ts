import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id }, include: { car: true } });
  if (!booking || booking.car.vendorId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const updated = await prisma.booking.update({ where: { id }, data: { paymentStatus: "CONFIRMED" } });
  return NextResponse.json({ success: true, booking: updated });
}
