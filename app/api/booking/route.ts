import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingNotification } from "@/lib/email";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { carId, renterName, renterPhone, startDate, endDate, transactionRef, website, couponCode, paymentMethod } = body;

  if (website) {
    return NextResponse.json({ success: true, booking: { totalPrice: 0, depositAmount: 0 } });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`booking:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  if (!carId || !renterName || !renterPhone || !transactionRef) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return NextResponse.json({ error: "Enter valid start and end dates, with the end after the start" }, { status: 400 });
  }

  const car = await prisma.car.findUnique({ where: { id: carId }, include: { vendor: true } });
  if (!car) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 });
  }

  if (paymentMethod !== "WHISH" && paymentMethod !== "OMT") {
    return NextResponse.json({ error: "Choose a payment method" }, { status: 400 });
  }
  if (paymentMethod === "WHISH" && !car.vendor.whishNumber) {
    return NextResponse.json({ error: "This agency hasn't set up Whish payments" }, { status: 400 });
  }
  if (paymentMethod === "OMT" && !car.vendor.omtNumber) {
    return NextResponse.json({ error: "This agency hasn't set up OMT payments" }, { status: 400 });
  }

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const baseTotal = days * car.pricePerDay;

  const couponPercent = car.vendor.couponPercent;
  const couponApplies = !!(
    couponCode &&
    car.vendor.couponCode &&
    couponPercent &&
    couponPercent > 0 &&
    couponPercent <= 100 &&
    String(couponCode).trim().toLowerCase() === car.vendor.couponCode.trim().toLowerCase()
  );
  const totalPrice = couponApplies
    ? Math.round(baseTotal * (1 - couponPercent! / 100) * 100) / 100
    : baseTotal;
  const depositAmount = Math.round(totalPrice * 0.3 * 100) / 100;

  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      const overlap = await tx.booking.findFirst({
        where: {
          carId,
          NOT: [{ endDate: { lte: start } }, { startDate: { gte: end } }],
        },
      });
      if (overlap) {
        throw new Error("DATES_TAKEN");
      }
      return tx.booking.create({
        data: { carId, renterName, renterPhone, startDate: start, endDate: end, totalPrice, depositAmount, paymentMethod, transactionRef },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "DATES_TAKEN") {
      return NextResponse.json({ error: "Those dates are already booked" }, { status: 409 });
    }
    throw err;
  }

  if (car.vendor.contactEmail) {
    await sendBookingNotification({
      to: car.vendor.contactEmail,
      carName: car.name,
      renterName,
      renterPhone,
      startDate: start.toLocaleDateString(),
      endDate: end.toLocaleDateString(),
      totalPrice,
      depositAmount,
      paymentMethod,
    });
  }

  return NextResponse.json({ success: true, booking });
}