import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car || car.vendorId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();
  const { brand, model, category, year, pricePerDay, transmission, seats, image, isRented } = body;

  const parsedYear = year !== undefined ? parseInt(year) : undefined;
  const parsedPrice = pricePerDay !== undefined ? parseFloat(pricePerDay) : undefined;
  const parsedSeats = seats !== undefined ? parseInt(seats) : undefined;

  if (
    (parsedYear !== undefined && Number.isNaN(parsedYear)) ||
    (parsedPrice !== undefined && (Number.isNaN(parsedPrice) || parsedPrice <= 0)) ||
    (parsedSeats !== undefined && (Number.isNaN(parsedSeats) || parsedSeats <= 0))
  ) {
    return NextResponse.json({ error: "Enter valid numbers for year, price per day, and seats" }, { status: 400 });
  }

  const updated = await prisma.car.update({
    where: { id },
    data: {
      ...(brand !== undefined && { brand }),
      ...(model !== undefined && { model }),
      ...(brand !== undefined && model !== undefined && { name: `${brand} ${model}` }),
      ...(category !== undefined && { category }),
      ...(parsedYear !== undefined && { year: parsedYear }),
      ...(parsedPrice !== undefined && { pricePerDay: parsedPrice }),
      ...(transmission !== undefined && { transmission }),
      ...(parsedSeats !== undefined && { seats: parsedSeats }),
      ...(image !== undefined && { image }),
      ...(isRented !== undefined && { isRented }),
    },
  });

  return NextResponse.json({ success: true, car: updated });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const car = await prisma.car.findUnique({ where: { id } });
  if (!car || car.vendorId !== userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.booking.deleteMany({ where: { carId: id } });
  await prisma.carPhoto.deleteMany({ where: { carId: id } });
  await prisma.car.delete({ where: { id } });

  return NextResponse.json({ success: true });
}