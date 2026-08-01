"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "../add-car/ImageUpload";
import { getDictionary, type Locale } from "@/lib/i18n";

type User = {
  logoUrl: string | null;
  description: string | null;
  phoneNumber: string | null;
  workingHours: string | null;
  whishNumber: string | null;
  omtNumber: string | null;
  couponCode: string | null;
  couponPercent: number | null;
};

export default function SettingsForm({ user, locale }: { user: User; locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.settings;
  const [form, setForm] = useState({
    logoUrl: user.logoUrl || "",
    description: user.description || "",
    phoneNumber: user.phoneNumber || "",
    workingHours: user.workingHours || "",
    whishNumber: user.whishNumber || "",
    omtNumber: user.omtNumber || "",
    couponCode: user.couponCode || "",
    couponPercent: user.couponPercent ? String(user.couponPercent) : "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || dict.common.somethingWrong); return; }
    setSuccess(t.updated);
    router.refresh();
  };

  return (
    <div className="auth-form-panel" style={{ minHeight: "100vh" }}>
      <form onSubmit={handleSubmit}>
        <h2>{t.title}</h2>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="error-msg" style={{ background: "#E6F4EA", color: "#1E7B34" }}>{success}</div>}

        <div className="field">
          <label>{t.logo}</label>
          <ImageUpload value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} locale={locale} />
        </div>
        <div className="field">
          <label>{t.description}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder={t.descriptionPlaceholder}
            style={{ width: "100%", padding: "12px 14px", borderRadius: "5px", border: "1.5px solid #D8D5CC", fontFamily: "inherit" }}
          />
        </div>
        <div className="field">
          <label>{t.phoneNumber}</label>
          <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder={t.phoneNumberPlaceholder} />
        </div>
        <div className="field">
          <label>{t.workingHours}</label>
          <input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder={t.workingHoursPlaceholder} />
        </div>
        <div className="field">
          <label>{t.whishNumber}</label>
          <input value={form.whishNumber} onChange={(e) => setForm({ ...form, whishNumber: e.target.value })} placeholder={t.paymentNumberPlaceholder} />
        </div>
        <div className="field">
          <label>{t.omtNumber}</label>
          <input value={form.omtNumber} onChange={(e) => setForm({ ...form, omtNumber: e.target.value })} placeholder={t.paymentNumberPlaceholder} />
        </div>
        <div className="field">
          <label>{t.couponCode}</label>
          <input value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} placeholder={t.couponCodePlaceholder} />
        </div>
        <div className="field">
          <label>{t.couponPercent}</label>
          <input type="number" min="1" max="100" value={form.couponPercent} onChange={(e) => setForm({ ...form, couponPercent: e.target.value })} placeholder={t.couponPercentPlaceholder} />
        </div>

        <button type="submit" className="submit-btn">{dict.common.save}</button>
      </form>

      <Link href="/dashboard" className="toggle-link">{dict.common.backToDashboard}</Link>
    </div>
  );
}
