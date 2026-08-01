import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car || car.vendorId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { url } = await request.json();
  const photo = await prisma.carPhoto.create({ data: { carId: id, url } });

  return NextResponse.json({ success: true, photo });
}