"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function FeatureButton({ carId, isFeatured, pending, locale }: { carId: string; isFeatured: boolean; pending: boolean; locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.dashboard;
  const whishNumber = process.env.NEXT_PUBLIC_PLATFORM_WHISH || "";
  const omtNumber = process.env.NEXT_PUBLIC_PLATFORM_OMT || "";
  const [showForm, setShowForm] = useState(false);
  const [method, setMethod] = useState<"WHISH" | "OMT">(whishNumber ? "WHISH" : "OMT");
  const [ref, setRef] = useState("");
  const router = useRouter();

  if (isFeatured) return <span className="featured-badge">{t.featured}</span>;
  if (pending) return <span className="car-meta">{t.featuredPending}</span>;

  if (!showForm) {
    return (
      <button className="toggle-link" style={{ margin: 0 }} onClick={() => setShowForm(true)}>
        {t.featureThisCar}
      </button>
    );
  }

  const payoutNumber = method === "WHISH" ? whishNumber : omtNumber;

  return (
    <div style={{ marginTop: "8px" }}>
      {whishNumber && omtNumber && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "6px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "normal", fontSize: "13px" }}>
            <input type="radio" checked={method === "WHISH"} onChange={() => setMethod("WHISH")} /> {dict.bookingForm.whish}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "normal", fontSize: "13px" }}>
            <input type="radio" checked={method === "OMT"} onChange={() => setMethod("OMT")} /> {dict.bookingForm.omt}
          </label>
        </div>
      )}
      <p className="car-meta">{t.featureInstructions(method === "WHISH" ? dict.bookingForm.whish : dict.bookingForm.omt, payoutNumber)}</p>
      <input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder={t.transactionRefPlaceholder}
        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #D8D5CC", marginRight: "8px" }}
      />
      <button
        className="toggle-link"
        style={{ margin: 0 }}
        onClick={async () => {
          await fetch(`/api/cars/${carId}/feature`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionRef: ref, paymentMethod: method }),
          });
          router.refresh();
        }}
      >
        {t.submit}
      </button>
    </div>
  );
}
