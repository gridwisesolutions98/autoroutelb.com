const path = require("path");
const os = require("os");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const ExcelJS = require("exceljs");

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const OUTPUT_PATH = path.join(os.homedir(), "Desktop", "AutoRoute-Admin-Data.xlsx");

function addSheet(workbook, name, columns, rows) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE4E1D8" } };
  rows.forEach((row) => sheet.addRow(row));
  sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };
  columns.forEach((col, i) => {
    const colLetter = sheet.getColumn(i + 1);
    colLetter.width = Math.max(col.header.length + 2, 14);
  });
  return sheet;
}

async function run() {
  const [agencies, cars, bookings, feedback, activity] = await Promise.all([
    prisma.user.findMany({
      where: { role: "VENDOR" },
      include: { subscription: true, cars: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.car.findMany({
      include: { vendor: { select: { companyName: true, username: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      include: { car: { select: { name: true, vendor: { select: { companyName: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AutoRoute LB Admin Export";
  workbook.created = new Date();

  addSheet(
    workbook,
    "Agencies",
    [
      { header: "Username", key: "username" },
      { header: "Company Name", key: "companyName" },
      { header: "Approval Status", key: "approvalStatus" },
      { header: "Blocked", key: "isBlocked" },
      { header: "Contact Email", key: "contactEmail" },
      { header: "Phone Number", key: "phoneNumber" },
      { header: "Whish #", key: "whishNumber" },
      { header: "OMT #", key: "omtNumber" },
      { header: "WhatsApp #", key: "whatsappNumber" },
      { header: "Address", key: "address" },
      { header: "Plan", key: "plan" },
      { header: "Billing Cycle", key: "billingCycle" },
      { header: "Sub. Status", key: "subStatus" },
      { header: "Sub. Payment Status", key: "subPaymentStatus" },
      { header: "Sub. Blocked", key: "subBlocked" },
      { header: "Sub. Expires", key: "subExpires" },
      { header: "Coupon Code", key: "couponCode" },
      { header: "Coupon %", key: "couponPercent" },
      { header: "Car Count", key: "carCount" },
      { header: "Registered", key: "createdAt" },
    ],
    agencies.map((a) => ({
      username: a.username,
      companyName: a.companyName || "",
      approvalStatus: a.approvalStatus,
      isBlocked: a.isBlocked ? "Yes" : "No",
      contactEmail: a.contactEmail || "",
      phoneNumber: a.phoneNumber || "",
      whishNumber: a.whishNumber || "",
      omtNumber: a.omtNumber || "",
      whatsappNumber: a.whatsappNumber || "",
      address: a.address || "",
      plan: a.subscription?.plan || "",
      billingCycle: a.subscription?.billingCycle || "",
      subStatus: a.subscription?.status || "",
      subPaymentStatus: a.subscription?.paymentStatus || "",
      subBlocked: a.subscription?.isBlocked ? "Yes" : "No",
      subExpires: a.subscription?.expiresAt ? a.subscription.expiresAt.toLocaleDateString() : "",
      couponCode: a.couponCode || "",
      couponPercent: a.couponPercent ?? "",
      carCount: a.cars.length,
      createdAt: a.createdAt.toLocaleDateString(),
    }))
  );

  addSheet(
    workbook,
    "Cars",
    [
      { header: "Name", key: "name" },
      { header: "Brand", key: "brand" },
      { header: "Model", key: "model" },
      { header: "Year", key: "year" },
      { header: "Category", key: "category" },
      { header: "Price/Day", key: "pricePerDay" },
      { header: "Transmission", key: "transmission" },
      { header: "Seats", key: "seats" },
      { header: "Agency", key: "agency" },
      { header: "Approved", key: "isApproved" },
      { header: "Rented", key: "isRented" },
      { header: "Featured", key: "isFeatured" },
      { header: "Featured Payment Status", key: "featuredPaymentStatus" },
      { header: "Views", key: "viewCount" },
      { header: "Listed", key: "createdAt" },
    ],
    cars.map((c) => ({
      name: c.name,
      brand: c.brand,
      model: c.model,
      year: c.year ?? "",
      category: c.category,
      pricePerDay: c.pricePerDay,
      transmission: c.transmission,
      seats: c.seats,
      agency: c.vendor?.companyName || c.vendor?.username || "",
      isApproved: c.isApproved ? "Yes" : "No",
      isRented: c.isRented ? "Yes" : "No",
      isFeatured: c.isFeatured ? "Yes" : "No",
      featuredPaymentStatus: c.featuredPaymentStatus,
      viewCount: c.viewCount,
      createdAt: c.createdAt.toLocaleDateString(),
    }))
  );

  addSheet(
    workbook,
    "Bookings",
    [
      { header: "Car", key: "car" },
      { header: "Agency", key: "agency" },
      { header: "Renter Name", key: "renterName" },
      { header: "Renter Phone", key: "renterPhone" },
      { header: "Start Date", key: "startDate" },
      { header: "End Date", key: "endDate" },
      { header: "Total Price", key: "totalPrice" },
      { header: "Deposit", key: "depositAmount" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Payment Status", key: "paymentStatus" },
      { header: "Transaction Ref", key: "transactionRef" },
      { header: "Booked On", key: "createdAt" },
    ],
    bookings.map((b) => ({
      car: b.car?.name || "",
      agency: b.car?.vendor?.companyName || "",
      renterName: b.renterName,
      renterPhone: b.renterPhone,
      startDate: b.startDate.toLocaleDateString(),
      endDate: b.endDate.toLocaleDateString(),
      totalPrice: b.totalPrice,
      depositAmount: b.depositAmount,
      paymentMethod: b.paymentMethod,
      paymentStatus: b.paymentStatus,
      transactionRef: b.transactionRef || "",
      createdAt: b.createdAt.toLocaleDateString(),
    }))
  );

  addSheet(
    workbook,
    "Feedback",
    [
      { header: "Name", key: "fullName" },
      { header: "Rating", key: "rating" },
      { header: "Message", key: "message" },
      { header: "Date", key: "createdAt" },
    ],
    feedback.map((f) => ({
      fullName: f.fullName,
      rating: f.rating,
      message: f.message,
      createdAt: f.createdAt.toLocaleDateString(),
    }))
  );

  addSheet(
    workbook,
    "Activity Log",
    [
      { header: "Action", key: "action" },
      { header: "Target Type", key: "targetType" },
      { header: "Target ID", key: "targetId" },
      { header: "Details", key: "details" },
      { header: "Date", key: "createdAt" },
    ],
    activity.map((a) => ({
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      details: a.details || "",
      createdAt: a.createdAt.toLocaleString(),
    }))
  );

  await workbook.xlsx.writeFile(OUTPUT_PATH);
  console.log(`Admin data exported to: ${OUTPUT_PATH}`);
  console.log(
    `Agencies: ${agencies.length} · Cars: ${cars.length} · Bookings: ${bookings.length} · Feedback: ${feedback.length} · Activity: ${activity.length}`
  );
}

run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
