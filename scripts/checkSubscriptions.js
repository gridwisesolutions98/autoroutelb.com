const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const nodemailer = require("nodemailer");
require("dotenv").config();

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

async function sendMail(to, subject, html) {
  if (!to) return;
  try {
    await transporter.sendMail({ from: `"AutoRoute LB" <${process.env.GMAIL_USER}>`, to, subject, html });
    console.log(`Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error("Email failed:", err.message);
  }
}

async function run() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // 1. Send renewal reminders for subs expiring within 7 days that haven't been reminded yet
  const expiringSoon = await prisma.subscription.findMany({
    where: {
      paymentStatus: "CONFIRMED",
      isBlocked: false,
      expiresAt: { lte: sevenDaysFromNow, gt: now },
      reminderSentAt: null,
    },
    include: { user: true },
  });

  for (const sub of expiringSoon) {
    await sendMail(
      sub.user.contactEmail,
      "Your subscription is expiring soon",
      `<h2>Subscription renewal reminder</h2><p>Hi ${sub.user.companyName},</p><p>Your subscription expires on ${sub.expiresAt.toLocaleDateString()}. Please renew via Whish to ${process.env.NEXT_PUBLIC_PLATFORM_WHISH}${process.env.NEXT_PUBLIC_PLATFORM_OMT ? ` or OMT to ${process.env.NEXT_PUBLIC_PLATFORM_OMT}` : ""}.</p>`
    );
    await prisma.subscription.update({ where: { id: sub.id }, data: { reminderSentAt: now } });
  }

  // 2. Block subscriptions that expired more than 3 days ago and aren't blocked yet
  const toBlock = await prisma.subscription.findMany({
    where: {
      isBlocked: false,
      expiresAt: { lt: threeDaysAgo },
    },
    include: { user: true },
  });

  for (const sub of toBlock) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { isBlocked: true } });
    await sendMail(
      sub.user.contactEmail,
      "Your account has been temporarily blocked",
      `<h2>Account blocked</h2><p>Hi ${sub.user.companyName},</p><p>Your subscription expired and the grace period has passed. Renew via Whish to ${process.env.NEXT_PUBLIC_PLATFORM_WHISH}${process.env.NEXT_PUBLIC_PLATFORM_OMT ? ` or OMT to ${process.env.NEXT_PUBLIC_PLATFORM_OMT}` : ""} to restore access.</p>`
    );
  }

  console.log(`Checked subscriptions: ${expiringSoon.length} reminder(s) sent, ${toBlock.length} account(s) blocked.`);
}

run()
  .catch((e) => console.error(e))
  .finally(() => process.exit(0));