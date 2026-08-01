import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { isValidAdminSessionToken } from "@/lib/session";
import AdminLogin from "./AdminLogin";
import ConfirmButton from "./ConfirmButton";
import AgencyActions from "./AgencyActions";
import UnblockButton from "./UnblockButton";

const PLAN_PRICES: Record<string, Record<string, number>> = {
  BASIC: { MONTHLY: 20, YEARLY: 200 },
  PREMIUM: { MONTHLY: 50, YEARLY: 500 },
};

// Matches the first-3-months promo shown on the subscribe page (app/dashboard/subscribe/page.tsx)
const PROMO_MONTHLY_PRICES: Record<string, number> = {
  BASIC: 15,
  PREMIUM: 35,
};
const PROMO_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

function isInPromoWindow(createdAt: Date) {
  return Date.now() - createdAt.getTime() < PROMO_WINDOW_MS;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = isValidAdminSessionToken(cookieStore.get("admin_session")?.value);

  if (!isAdmin) return <AdminLogin />;

  const [
    totalAgencies,
    totalCars,
    activeSubscriptions,
    bookingRevenue,
    pendingAgencies,
    pendingSubs,
    pendingFeatured,
    blockedSubs,

  ] = await Promise.all([
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.car.count(),
    prisma.subscription.findMany({ where: { paymentStatus: "CONFIRMED" }, include: { user: { select: { createdAt: true } } } }),
    prisma.booking.aggregate({ where: { paymentStatus: "CONFIRMED" }, _sum: { totalPrice: true } }),
    prisma.user.findMany({ where: { approvalStatus: "PENDING" }, omit: { password: true }, orderBy: { createdAt: "desc" } }),
    prisma.subscription.findMany({ where: { paymentStatus: "PENDING" }, include: { user: { omit: { password: true } } } }),
    prisma.car.findMany({ where: { featuredPaymentStatus: "PENDING", featuredTransactionRef: { not: null } }, include: { vendor: { omit: { password: true } } } }),
    prisma.subscription.findMany({ where: { isBlocked: true }, include: { user: { omit: { password: true } } } }),

  ]);

  const estimatedSubRevenue = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === "MONTHLY" && isInPromoWindow(sub.user.createdAt)) {
      return sum + (PROMO_MONTHLY_PRICES[sub.plan] ?? 0);
    }
    return sum + (PLAN_PRICES[sub.plan]?.[sub.billingCycle] || 0);
  }, 0);

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <span className="plate-badge">AutoRoute <span className="tag">LB</span></span>
        <Link href="/admin/agencies" className="toggle-link" style={{ margin: 0 }}>Manage agencies →</Link>
      </div>
      <h1 style={{ margin: "20px 0" }}>Admin</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-value">{totalAgencies}</p>
          <p className="car-meta">Total agencies</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{totalCars}</p>
          <p className="car-meta">Total cars listed</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{activeSubscriptions.length}</p>
          <p className="car-meta">Active subscriptions</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">${bookingRevenue._sum.totalPrice || 0}</p>
          <p className="car-meta">Confirmed booking value</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">${estimatedSubRevenue}</p>
          <p className="car-meta">Est. subscription revenue (current cycle)</p>
        </div>
      </div>

      <h2 style={{ fontSize: "1.1rem", marginTop: "30px" }}>New agency applications</h2>
      {pendingAgencies.length === 0 && <p style={{ color: "var(--text-muted)" }}>None pending.</p>}
      {pendingAgencies.map((agency) => (
        <div key={agency.id} className="car-card" style={{ padding: "16px", marginBottom: "12px" }}>
          <p><strong>{agency.companyName}</strong> (@{agency.username})</p>
          <p className="car-meta">{agency.contactEmail || "no email"} · {agency.whishNumber || "no Whish#"}</p>
          <p className="car-meta">{agency.address || "no address"}</p>
          <AgencyActions userId={agency.id} />
        </div>
      ))}

      <h2 style={{ fontSize: "1.1rem", marginTop: "30px" }}>Vendor subscriptions</h2>
      {pendingSubs.length === 0 && <p style={{ color: "var(--text-muted)" }}>None pending.</p>}
      {pendingSubs.map((sub) => (
        <div key={sub.id} className="car-card" style={{ padding: "16px", marginBottom: "12px" }}>
          <p><strong>{sub.user.companyName}</strong> (@{sub.user.username})</p>
          <p className="car-meta">Via {sub.paymentMethod} · Ref: {sub.transactionRef || "not submitted yet"}</p>
          <ConfirmButton type="subscription" id={sub.id} />
        </div>
      ))}

      <h2 style={{ fontSize: "1.1rem", marginTop: "30px" }}>Blocked agencies</h2>
      {blockedSubs.length === 0 && <p style={{ color: "var(--text-muted)" }}>None blocked.</p>}
      {blockedSubs.map((sub) => (
        <div key={sub.id} className="car-card" style={{ padding: "16px", marginBottom: "12px" }}>
          <p><strong>{sub.user.companyName}</strong> (@{sub.user.username})</p>
          <p className="car-meta">Expired: {new Date(sub.expiresAt).toLocaleDateString()}</p>
          <UnblockButton subscriptionId={sub.id} />
        </div>
      ))}

      <h2 style={{ fontSize: "1.1rem", marginTop: "30px" }}>Featured listing requests</h2>
      {pendingFeatured.length === 0 && <p style={{ color: "var(--text-muted)" }}>None pending.</p>}
      {pendingFeatured.map((car) => (
        <div key={car.id} className="car-card" style={{ padding: "16px", marginBottom: "12px" }}>
          <p><strong>{car.name}</strong> — {car.vendor.companyName}</p>
          <p className="car-meta">Via {car.featuredPaymentMethod} · Ref: {car.featuredTransactionRef || "not submitted yet"}</p>
          <ConfirmButton type="featured" id={car.id} />
        </div>
      ))}

    </div>
  );
}