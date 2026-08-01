import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/app/components/ShareButtons";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getAgency(rawUsername: string) {
  let username = rawUsername;
  try {
    username = decodeURIComponent(rawUsername);
  } catch {
    // rawUsername wasn't URI-encoded; use as-is
  }

  const agency = await prisma.user.findUnique({
    where: { username },
    include: {
      cars: { where: { isApproved: true, isRented: false }, orderBy: { createdAt: "desc" } },
    },
    omit: { password: true },
  });
  if (!agency || agency.approvalStatus !== "APPROVED") return null;
  return agency;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const agency = await getAgency(username);
  if (!agency) return {};

  const title = `${agency.companyName} — Car Rentals in Lebanon`;
  const description = agency.description || `Browse cars for rent from ${agency.companyName} on AutoRoute LB.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: agency.logoUrl ? [{ url: agency.logoUrl }] : undefined,
    },
  };
}

export default async function AgencyProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const agency = await getAgency(username);
  if (!agency) notFound();

  const baseUrl = SITE_URL;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: agency.companyName || agency.username,
    image: agency.logoUrl || undefined,
    description: agency.description || undefined,
    address: agency.address || undefined,
    telephone: agency.phoneNumber || undefined,
    url: `${baseUrl}/agencies/${encodeURIComponent(agency.username)}`,
  };

  return (
    <div className="dash-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="dash-header">
        <span className="plate-badge">AutoRoute <span className="tag">LB</span></span>
        <Link href="/cars" className="toggle-link" style={{ margin: 0 }}>{t.agency.allCars}</Link>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", margin: "24px 0", flexWrap: "wrap" }}>
        {agency.logoUrl && (
          <img src={agency.logoUrl} alt={agency.companyName || agency.username} loading="lazy" decoding="async" style={{ width: "110px", height: "110px", objectFit: "cover", borderRadius: "8px" }} />
        )}
        <div>
          <h1 style={{ marginBottom: "6px" }}>{agency.companyName}</h1>
          {agency.description && <p className="car-meta" style={{ marginBottom: "8px" }}>{agency.description}</p>}
          {agency.address && <p className="car-meta">📍 {agency.address}</p>}
          {agency.workingHours && <p className="car-meta">🕒 {agency.workingHours}</p>}
          {agency.phoneNumber && <p className="car-meta">📞 {agency.phoneNumber}</p>}
          <div style={{ marginTop: "12px" }}>
            <ShareButtons url={`${baseUrl}/agencies/${encodeURIComponent(agency.username)}`} title={`${agency.companyName} on AutoRoute LB`} />
          </div>
        </div>
      </div>

      {agency.couponCode && agency.couponPercent && (
        <div style={{ background: "#FBF6E8", padding: "14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
          {t.agency.couponBanner(agency.couponCode, agency.couponPercent)}
        </div>
      )}

      <h2 style={{ margin: "20px 0" }}>{t.agency.fleet}</h2>
      {agency.cars.length === 0 && <p className="car-meta">{t.agency.noCarsYet}</p>}

      <div className="car-grid">
        {agency.cars.map((car) => (
          <Link href={`/cars/${car.id}`} key={car.id} className="car-card" style={{ position: "relative" }}>
            {car.isFeatured && <span className="featured-badge-corner">★ Featured</span>}
            <img src={car.image} alt={car.name} loading="lazy" decoding="async" />
            <div className="car-card-body">
              <h3>{car.name} {car.year && `(${car.year})`}</h3>
              <p className="car-meta">{car.category} · {car.transmission} · {car.seats} {t.common.seats}</p>
              <p className="car-price">${car.pricePerDay}{t.common.perDay}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
