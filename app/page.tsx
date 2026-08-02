import Link from "next/link";
import { cookies } from "next/headers";
import { getDictionary, Locale } from "@/lib/i18n";
import HeroNav from "./HeroNav";

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value === "ar" ? "ar" : "en") as Locale;
  const t = getDictionary(locale);

  return (
    <div className="hero">
      <HeroNav t={t.nav} locale={locale} />

      <div className="hero-badge">
        <span className="plate-badge">
          AutoRoute <span className="tag">LB</span>
        </span>
      </div>
      <h1>{t.home.tagline}</h1>
      <p>{t.home.subtitle}</p>
      <div className="hero-actions" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/cars" className="cta-plate">
          {t.home.bookCar}
        </Link>
        <Link href="/login" className="cta-plate" style={{ background: "transparent", border: "2px solid var(--gold)", color: "var(--gold)" }}>
          {t.home.listCars}
        </Link>
      </div>

      <section id="about" className="hero-section">
        <h2>{t.home.aboutTitle}</h2>
        <p>{t.home.aboutText}</p>
      </section>

      <section id="contact" className="hero-section">
        <h2>{t.home.contactTitle}</h2>
        <p>{t.home.email}: AutoRoute.Lb@gmail.com</p>
        <p>{t.home.phone}: +961 76 346 074</p>
        <p>{t.home.craftedBy}</p>
      </section>
    </div>
  );
}