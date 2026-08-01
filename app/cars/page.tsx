import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FeedbackSection from "../components/FeedbackSection";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Available Cars for Rent in Lebanon",
  description: "Browse cars for rent from trusted agencies across Lebanon. Filter by category, transmission, price, and location.",
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; transmission?: string; minPrice?: string; maxPrice?: string; location?: string }>;
}) {
  const { category, transmission, minPrice, maxPrice, location } = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);

  const cars = await prisma.car.findMany({
    where: {
      isApproved: true,
      isRented: false,
      vendor: {
        approvalStatus: "APPROVED",
        subscription: { isBlocked: false },
        ...(location && { address: { contains: location } }),
      },
      ...(category && { category }),
      ...(transmission && { transmission }),
      ...(minPrice && { pricePerDay: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { pricePerDay: { ...(minPrice ? { gte: parseFloat(minPrice) } : {}), lte: parseFloat(maxPrice) } }),
    },
    include: { vendor: { omit: { password: true } } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const categories = await prisma.car.findMany({
    where: { isApproved: true },
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="dash-wrap">
      <div className="dash-header">
        <span className="plate-badge">AutoRoute <span className="tag">LB</span></span>
      </div>
      <h1 style={{ margin: "20px 0" }}>{t.cars.title}</h1>

      <form className="filter-bar" method="get">
        <input type="text" name="location" placeholder={t.cars.locationPlaceholder} defaultValue={location || ""} />

        <select name="category" defaultValue={category || ""}>
          <option value="">{t.cars.allCategories}</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>{c.category}</option>
          ))}
        </select>

        <select name="transmission" defaultValue={transmission || ""}>
          <option value="">{t.cars.anyTransmission}</option>
          <option value="Automatic">{t.cars.automatic}</option>
          <option value="Manual">{t.cars.manual}</option>
        </select>

        <input type="number" name="minPrice" placeholder={t.cars.minPrice} defaultValue={minPrice || ""} />
        <input type="number" name="maxPrice" placeholder={t.cars.maxPrice} defaultValue={maxPrice || ""} />

        <button type="submit" className="toggle-link" style={{ margin: 0, background: "var(--ink)", color: "white", padding: "10px 18px", borderRadius: "5px" }}>
          {t.cars.filter}
        </button>
        <Link href="/cars" className="toggle-link" style={{ margin: 0 }}>{t.cars.clear}</Link>
      </form>

      {cars.length === 0 && <p className="car-meta">{t.cars.noMatch}</p>}

      <div className="car-grid">
        {cars.map((car) => (
          <Link href={`/cars/${car.id}`} key={car.id} className="car-card" style={{ position: "relative" }}>
            {car.isFeatured && <span className="featured-badge-corner">★ Featured</span>}
            <img src={car.image} alt={car.name} loading="lazy" decoding="async" />
            <div className="car-card-body">
              <p className="car-meta" style={{ marginBottom: "2px" }}>{car.vendor.companyName}</p>
              <h3>{car.name} {car.year && `(${car.year})`}</h3>
              <p className="car-meta">{car.category} · {car.transmission} · {car.seats} {t.common.seats}</p>
              {car.vendor.address && <p className="car-meta">📍 {car.vendor.address}</p>}
              <p className="car-price">${car.pricePerDay}{t.common.perDay}</p>
            </div>
          </Link>
        ))}
      </div>

      <FeedbackSection locale={locale} />
    </div>
  );
}
