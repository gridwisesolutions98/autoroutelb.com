"use client";
import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function SubscribeForm({
  existingRef,
  locale,
  whishNumber,
  omtNumber,
}: {
  existingRef: string;
  locale: Locale;
  whishNumber: string;
  omtNumber: string;
}) {
  const dict = getDictionary(locale);
  const t = dict.subscribe;
  const [plan, setPlan] = useState("BASIC");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [paymentMethod, setPaymentMethod] = useState<"WHISH" | "OMT">(whishNumber ? "WHISH" : "OMT");
  const [transactionRef, setTransactionRef] = useState(existingRef);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/subscription/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionRef, plan, billingCycle, paymentMethod }),
    });
    if (!res.ok) { setError(dict.common.somethingWrong); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return <p style={{ color: "var(--text-muted)" }}>{t.submitted}</p>;
  }

  const payoutNumber = paymentMethod === "WHISH" ? whishNumber : omtNumber;

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-msg">{error}</div>}

      {whishNumber && omtNumber && (
        <div className="field">
          <label>{t.payVia}</label>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal" }}>
              <input type="radio" checked={paymentMethod === "WHISH"} onChange={() => setPaymentMethod("WHISH")} /> {dict.bookingForm.whish}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal" }}>
              <input type="radio" checked={paymentMethod === "OMT"} onChange={() => setPaymentMethod("OMT")} /> {dict.bookingForm.omt}
            </label>
          </div>
        </div>
      )}

      <p style={{ color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
        {t.instructions(paymentMethod === "WHISH" ? dict.bookingForm.whish : dict.bookingForm.omt, payoutNumber)}
      </p>

      <div className="field">
        <label>{t.plan}</label>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: "5px", border: "1.5px solid #D8D5CC" }}>
          <option value="BASIC">{t.basicTitle}</option>
          <option value="PREMIUM">{t.premiumTitle}</option>
        </select>
      </div>

      <div className="field">
        <label>{t.billingCycle}</label>
        <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: "5px", border: "1.5px solid #D8D5CC" }}>
          <option value="MONTHLY">{t.monthly}</option>
          <option value="YEARLY">{t.yearly}</option>
        </select>
      </div>

      <div className="field">
        <label>{t.transactionRef}</label>
        <input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} required />
      </div>

      <button type="submit" className="submit-btn">{t.submitForConfirmation}</button>
    </form>
  );
}
