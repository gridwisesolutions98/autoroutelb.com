"use client";
import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function BookingForm({
  carId,
  pricePerDay,
  whishNumber,
  omtNumber,
  couponCode,
  couponPercent,
  locale,
}: {
  carId: string;
  pricePerDay: number;
  whishNumber: string | null;
  omtNumber: string | null;
  couponCode?: string | null;
  couponPercent?: number | null;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [renterName, setRenterName] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [enteredCoupon, setEnteredCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"WHISH" | "OMT">(whishNumber ? "WHISH" : "OMT");
  const [transactionRef, setTransactionRef] = useState("");
  const [acknowledgedNonRefundable, setAcknowledgedNonRefundable] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const days = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 0;
  const baseTotal = days * pricePerDay;
  const couponApplies = !!(couponCode && couponPercent && enteredCoupon.trim().toLowerCase() === couponCode.trim().toLowerCase());
  const total = couponApplies ? Math.round(baseTotal * (1 - couponPercent! / 100) * 100) / 100 : baseTotal;
  const deposit = Math.round(total * 0.3 * 100) / 100;
  const remainingBalance = Math.round((total - deposit) * 100) / 100;
  const payoutNumber = paymentMethod === "WHISH" ? whishNumber : omtNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId, renterName, renterPhone, startDate, endDate, transactionRef, website, couponCode: enteredCoupon, paymentMethod }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    const balanceDue = Math.round((data.booking.totalPrice - data.booking.depositAmount) * 100) / 100;
    setSuccess(t.bookingForm.bookingRequested(data.booking.depositAmount, balanceDue));
  };

  if (!whishNumber && !omtNumber) {
    return <p className="car-meta" style={{ marginTop: "24px" }}>{t.carDetail.onlinePaymentsUnavailable}</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="error-msg" style={{ background: "#E6F4EA", color: "#1E7B34" }}>{success}</div>}

      <div className="field">
        <label>{t.bookingForm.yourName}</label>
        <input value={renterName} onChange={(e) => setRenterName(e.target.value)} required />
      </div>
      <div className="field">
        <label>{t.bookingForm.phoneNumber}</label>
        <input value={renterPhone} onChange={(e) => setRenterPhone(e.target.value)} required />
      </div>
      <div className="field">
        <label>{t.bookingForm.startDate}</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </div>
      <div className="field">
        <label>{t.bookingForm.endDate}</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </div>
      <div className="field">
        <label>{t.bookingForm.couponCodeOptional}</label>
        <input value={enteredCoupon} onChange={(e) => setEnteredCoupon(e.target.value)} placeholder={t.bookingForm.haveCode} />
      </div>

      <div className="field">
        <label>{t.bookingForm.payVia}</label>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {whishNumber && (
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal" }}>
              <input type="radio" checked={paymentMethod === "WHISH"} onChange={() => setPaymentMethod("WHISH")} /> {t.bookingForm.whish}
            </label>
          )}
          {omtNumber && (
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "normal" }}>
              <input type="radio" checked={paymentMethod === "OMT"} onChange={() => setPaymentMethod("OMT")} /> {t.bookingForm.omt}
            </label>
          )}
        </div>
      </div>

      {days > 0 && (
        <p style={{ marginBottom: "20px" }}>
          <strong>{t.bookingForm.daysTotal(days, total)}</strong>
          {couponApplies && <span style={{ color: "#1E7B34" }}> {t.bookingForm.offApplied(couponPercent!)}</span>}
        </p>
      )}

      {days > 0 && (
        <div style={{ background: "#FBF6E8", padding: "14px", borderRadius: "6px", marginBottom: "20px", fontSize: "14px" }}>
          {t.bookingForm.depositNotice(deposit, paymentMethod === "WHISH" ? t.bookingForm.whish : t.bookingForm.omt, payoutNumber || "")}
          <br /><strong>{t.bookingForm.nonRefundable}</strong>
          <br />{t.bookingForm.remainingCash(remainingBalance)}
        </div>
      )}

      <div className="field">
        <label>{t.bookingForm.transactionReference}</label>
        <input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} required />
      </div>

      <div className="field" style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <input
          type="checkbox"
          id="ack-nonrefundable"
          checked={acknowledgedNonRefundable}
          onChange={(e) => setAcknowledgedNonRefundable(e.target.checked)}
          required
          style={{ marginTop: "4px" }}
        />
        <label htmlFor="ack-nonrefundable" style={{ fontWeight: "normal" }}>
          {t.bookingForm.ackNonRefundable}
        </label>
      </div>

      <button type="submit" className="submit-btn">{t.bookingForm.confirmBooking}</button>
    </form>
  );
}
