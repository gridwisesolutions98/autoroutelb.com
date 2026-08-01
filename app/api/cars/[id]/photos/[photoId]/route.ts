import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  const { id, photoId } = await params;

  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car || car.vendorId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const photo = await prisma.carPhoto.findUnique({ where: { id: photoId } });
  if (!photo || photo.carId !== id) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  await prisma.carPhoto.delete({ where: { id: photoId } });

  return NextResponse.json({ success: true });
}