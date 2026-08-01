import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
import CarActions from "./CarActions";
import FeatureButton from "./FeatureButton";
import ShareButtons from "@/app/components/ShareButtons";
import { getBaseUrl } from "@/lib/site";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function DashboardPage() {
  const userId = await getSession();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { cars: true, subscription: true },
  });

  const baseUrl = await getBaseUrl();
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <span className="plate-badge">AutoRoute <span className="tag">LB</span></span>
        <SignOutButton locale={locale} />
      </div>

      <div className="dash-top-row">
        <h1>{t.dashboard.fleetTitle(user?.companyName || "")}</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/dashboard/settings" className="toggle-link" style={{ margin: 0 }}>
            {t.dashboard.editProfile}
          </Link>
          <Link href="/dashboard/bookings" className="toggle-link" style={{ margin: 0 }}>
            {t.dashboard.bookings}
          </Link>
          <Link
            href={
              user?.subscription?.isBlocked
                ? "/dashboard/subscribe"
                : user?.subscription?.paymentStatus === "CONFIRMED"
                ? "/dashboard/add-car"
                : "/dashboard/subscribe"
            }
            className="cta-plate"
          >
            {t.dashboard.addCar}
          </Link>
        </div>
      </div>

      {user?.username && (
        <div style={{ margin: "16px 0" }}>
          <p className="car-meta" style={{ marginBottom: "6px" }}>{t.dashboard.shareProfile}</p>
          <ShareButtons url={`${baseUrl}/agencies/${encodeURIComponent(user.username)}`} title={`${user.companyName} on AutoRoute LB`} />
        </div>
      )}

      {user?.approvalStatus === "PENDING" && (
        <div style={{ background: "#FBF6E8", padding: "14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
          {t.dashboard.pendingApplication}
        </div>
      )}

      {user?.approvalStatus === "REJECTED" && (
        <div style={{ background: "#FBEAE5", padding: "14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
          {t.dashboard.rejectedApplication}
        </div>
      )}

      {user?.subscription?.paymentStatus === "PENDING" && (
        <div style={{ background: "#FBF6E8", padding: "14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
          {t.dashboard.paymentPending(process.env.NEXT_PUBLIC_PLATFORM_WHISH || "", process.env.NEXT_PUBLIC_PLATFORM_OMT || "")}
        </div>
      )}

      {user?.subscription?.isBlocked && (
        <div style={{ background: "#FBEAE5", padding: "14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
          {t.dashboard.blocked(process.env.NEXT_PUBLIC_PLATFORM_WHISH || "", process.env.NEXT_PUBLIC_PLATFORM_OMT || "")}
        </div>
      )}

      {user?.subscription?.paymentStatus === "CONFIRMED" &&
        !user.subscription.isBlocked &&
        new Date(user.subscription.expiresAt).getTime() - Date.now() < 5 * 24 * 60 * 60 * 1000 && (
          <div style={{ background: "#FBEAE5", padding: "14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
            {t.dashboard.expiring(new Date(user.subscription.expiresAt).toLocaleDateString(), process.env.NEXT_PUBLIC_PLATFORM_WHISH || "", process.env.NEXT_PUBLIC_PLATFORM_OMT || "")}
          </div>
        )}

      {user?.cars.length === 0 && <p style={{ color: "var(--text-muted)" }}>{t.dashboard.noCarsYet}</p>}

      <div className="car-grid">
        {user?.cars.map((car) => (
          <div className="car-card" key={car.id} style={{ position: "relative" }}>
            {car.isRented && <span className="rented-badge">{t.dashboard.rented}</span>}
            <img src={car.image} alt={car.name} loading="lazy" decoding="async" />
            <div className="car-card-body">
              <h3>{car.name} {car.year && `(${car.year})`}</h3>
              <p className="car-meta">{car.category} · {car.transmission} · {car.seats} {t.common.seats}</p>
              <p className="car-price">${car.pricePerDay}{t.common.perDay}</p>
              <p className="car-meta">{t.dashboard.views(car.viewCount)}</p>
              <div style={{ margin: "8px 0" }}>
                <ShareButtons url={`${baseUrl}/cars/${car.id}`} title={`${car.name} on AutoRoute LB`} />
              </div>
              <CarActions carId={car.id} isRented={car.isRented} locale={locale} />
              <FeatureButton
                carId={car.id}
                isFeatured={car.isFeatured}
                pending={car.featuredPaymentStatus === "PENDING" && !!car.featuredTransactionRef}
                locale={locale}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
