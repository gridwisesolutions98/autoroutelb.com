import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BookingForm from "./BookingForm";
import Calendar from "./calendar";
import ShareButtons from "@/app/components/ShareButtons";
import { getBaseUrl } from "@/lib/site";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

const getCar = cache(async (id: string) => {
  return prisma.car.findUnique({
    where: { id },
    include: { vendor: { omit: { password: true } }, bookings: true },
  });
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) return {};

  const title = `${car.name}${car.year ? ` (${car.year})` : ""} — Rent in Lebanon`;
  const description = `Rent the ${car.name} from ${car.vendor.companyName} in Lebanon. $${car.pricePerDay}/day · ${car.category} · ${car.transmission} · ${car.seats} seats.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: car.image ? [{ url: car.image }] : undefined,
    },
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const car = await getCar(id);
  if (!car) notFound();

  prisma.car.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const baseUrl = await getBaseUrl();
  const locale = await getLocale();
  const t = getDictionary(locale);

  const bookingDates = car.bookings.map((b) => ({
    startDate: b.startDate.toISOString(),
    endDate: b.endDate.toISOString(),
  }));

  const whatsappLink = car.vendor.whatsappNumber
    ? `https://wa.me/${car.vendor.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.name}`)}`
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.name,
    image: car.image ? [car.image] : undefined,
    brand: car.brand || undefined,
    model: car.model || undefined,
    offers: {
      "@type": "Offer",
      price: car.pricePerDay,
      priceCurrency: "USD",
      availability: car.isRented ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${baseUrl}/cars/${car.id}`,
    },
    seller: {
      "@type": "Organization",
      name: car.vendor.companyName || undefined,
    },
  };

  return (
    <div className="dash-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="dash-header">
        <span className="plate-badge">AutoRoute <span className="tag">LB</span></span>
      </div>
      <div className="car-detail">
        <div className="car-photo-frame">
          <img src={car.image} alt={car.name} fetchPriority="high" decoding="async" />
        </div>
        <div>
          <p className="car-meta" style={{ marginBottom: "4px" }}>
            {t.carDetail.listedBy} <Link href={`/agencies/${encodeURIComponent(car.vendor.username)}`}>{car.vendor.companyName}</Link>
          </p>
          <h1>{car.name} {car.year && `(${car.year})`}</h1>

          <div className="spec-chips">
            <span className="spec-chip"><span className="icon">🚘</span>{car.category}</span>
            <span className="spec-chip"><span className="icon">⚙️</span>{car.transmission}</span>
            <span className="spec-chip"><span className="icon">👤</span>{car.seats} {t.common.seats}</span>
            {car.year && <span className="spec-chip"><span className="icon">📅</span>{car.year}</span>}
          </div>

          <p className="price-plate">${car.pricePerDay}<span className="unit">{t.common.perDay}</span></p>
          {car.vendor.workingHours && <p className="car-meta" style={{ marginTop: "12px" }}>🕒 {car.vendor.workingHours}</p>}

          <div style={{ margin: "16px 0" }}>
            <ShareButtons url={`${baseUrl}/cars/${car.id}`} title={`${car.name} on AutoRoute LB`} />
          </div>

          <div style={{ display: "flex", gap: "10px", margin: "16px 0", flexWrap: "wrap" }}>
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp">
                {t.carDetail.messageWhatsapp}
              </a>
            )}
            {car.vendor.contactEmail && (
              <a href={`mailto:${car.vendor.contactEmail}?subject=${encodeURIComponent(`Inquiry about ${car.name}`)}`} className="contact-btn email">
                {t.carDetail.emailAgency}
              </a>
            )}
          </div>

          {car.vendor.address && (
            <div style={{ marginTop: "20px" }}>
              <p className="car-meta" style={{ marginBottom: "8px" }}>{t.carDetail.agencyLocation}: {car.vendor.address}</p>
              <iframe
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: "8px" }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(car.vendor.address + ", Lebanon")}&output=embed`}
              />
            </div>
          )}

          {car.vendor.couponCode && car.vendor.couponPercent && (
            <div style={{ background: "#FBF6E8", padding: "14px", borderRadius: "6px", margin: "20px 0", fontSize: "14px" }}>
              {t.carDetail.couponBanner(car.vendor.couponCode, car.vendor.couponPercent)}
            </div>
          )}

          <div className="road-divider" />

          <h2 className="section-heading"><span className="icon">📅</span>{t.carDetail.availability}</h2>
          <Calendar bookings={bookingDates} locale={locale} />

          <div className="road-divider" />

          <h2 className="section-heading"><span className="icon">🔑</span>{t.carDetail.reserveThisCar}</h2>
          <BookingForm
            carId={car.id}
            pricePerDay={car.pricePerDay}
            whishNumber={car.vendor.whishNumber}
            omtNumber={car.vendor.omtNumber}
            couponCode={car.vendor.couponCode}
            couponPercent={car.vendor.couponPercent}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
