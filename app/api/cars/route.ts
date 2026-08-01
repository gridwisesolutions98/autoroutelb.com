import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true, cars: true },
  });

  // Check if the agency application has been approved by the admin
  if (user?.approvalStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "Your agency account is pending approval by admin. You cannot add cars yet." },
      { status: 403 }
    );
  }

  if (user?.subscription?.paymentStatus !== "CONFIRMED" || user.subscription.isBlocked) {
    return NextResponse.json({ error: "Subscription not active" }, { status: 403 });
  }

  if (user.subscription.plan === "BASIC" && user.cars.length >= 15) {
    return NextResponse.json(
      { error: "Basic plan allows up to 15 cars. Upgrade to Premium for unlimited listings." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { brand, model, category, year, pricePerDay, transmission, seats, image, photos } = body;

  if (!brand || !model || !category || !transmission || !image) {
    return NextResponse.json({ error: "Brand, model, category, transmission, and a cover photo are required" }, { status: 400 });
  }

  const parsedYear = year ? parseInt(year) : undefined;
  const parsedPrice = parseFloat(pricePerDay);
  const parsedSeats = parseInt(seats);

  if (
    (parsedYear !== undefined && Number.isNaN(parsedYear)) ||
    Number.isNaN(parsedPrice) || parsedPrice <= 0 ||
    Number.isNaN(parsedSeats) || parsedSeats <= 0
  ) {
    return NextResponse.json({ error: "Enter valid numbers for year, price per day, and seats" }, { status: 400 });
  }

  const car = await prisma.car.create({
    data: {
      name: `${brand} ${model}`,
      brand,
      model,
      category,
      year: parsedYear,
      pricePerDay: parsedPrice,
      transmission,
      seats: parsedSeats,
      image,
      vendorId: userId,
      photos: Array.isArray(photos) && photos.length > 0
        ? { create: photos.filter((url: string) => !!url).map((url: string) => ({ url })) }
        : undefined,
    },
  });

  return NextResponse.json({ success: true, car });
}

export async function GET() {
  const cars = await prisma.car.findMany({
    where: { isApproved: true, vendor: { approvalStatus: "APPROVED", subscription: { isBlocked: false } } },
    include: { vendor: { omit: { password: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ cars });
}