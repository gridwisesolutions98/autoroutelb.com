import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "AutoRoute LB's refund policy for subscriptions and booking deposits.",
};

export default async function RefundPolicy() {
  const locale = await getLocale();
  const t = getDictionary(locale).legal.refund;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-gray-800" dir={locale === "ar" ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{t.effectiveDate}</p>

      <p className="mb-6">{t.intro}</p>

      <section className="space-y-6">
        {t.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
            {section.paragraphs?.map((p, i) => (
              <p className="mb-2" key={i}>{p}</p>
            ))}
            {section.list && (
              <ul className="list-disc pl-6 space-y-1">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
