import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import ConfirmBookingButton from "./ConfirmBookingButton";

export default async function BookingsPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { car: { vendorId: userId } },
    include: { car: true },
    orderBy: { createdAt: "desc" },
  });

  const pending = bookings.filter((b) => b.paymentStatus === "PENDING");
  const confirmed = bookings.filter((b) => b.paymentStatus === "CONFIRMED");

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.bookingsPage;

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <span className="plate-badge">AutoRoute <span className="tag">LB</span></span>
        <Link href="/dashboard" className="toggle-link" style={{ margin: 0 }}>{dict.common.backToDashboard}</Link>
      </div>
      <h1 style={{ margin: "20px 0" }}>{t.title}</h1>

      <h2 style={{ fontSize: "1.1rem" }}>{t.awaitingConfirmation}</h2>
      {pending.length === 0 && <p className="car-meta">{t.nonePending}</p>}
      {pending.map((b) => (
        <div key={b.id} className="car-card" style={{ padding: "16px", marginBottom: "12px" }}>
          <p><strong>{b.car.name}</strong> — {b.renterName} ({b.renterPhone})</p>
          <p className="car-meta">
            {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
          </p>
          <p className="car-meta">
            {t.totalDeposit(b.totalPrice, b.depositAmount, b.paymentMethod)} · {t.ref(b.transactionRef || t.refNotSubmitted)}
          </p>
          <p className="car-meta">{t.cashOnPickup(Math.round((b.totalPrice - b.depositAmount) * 100) / 100)}</p>
          <ConfirmBookingButton id={b.id} label={t.confirmPaymentReceived} />
        </div>
      ))}

      <h2 style={{ fontSize: "1.1rem", marginTop: "30px" }}>{t.confirmedTitle}</h2>
      {confirmed.length === 0 && <p className="car-meta">{t.noneYet}</p>}
      {confirmed.map((b) => (
        <div key={b.id} className="car-card" style={{ padding: "16px", marginBottom: "12px" }}>
          <p><strong>{b.car.name}</strong> — {b.renterName} ({b.renterPhone})</p>
          <p className="car-meta">
            {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
          </p>
          <p className="car-meta">{t.totalDepositConfirmed(b.totalPrice, b.depositAmount, b.paymentMethod)}</p>
          <p className="car-meta">{t.cashOnPickup(Math.round((b.totalPrice - b.depositAmount) * 100) / 100)}</p>
        </div>
      ))}
    </div>
  );
}
