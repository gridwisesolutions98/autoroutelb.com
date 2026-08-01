"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "./ImageUpload";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function AddCarForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.carForm;
  const [form, setForm] = useState({
    brand: "", model: "", year: "", category: "", pricePerDay: "", transmission: "Automatic", seats: "4", image: "",
  });
  const [extraPhotos, setExtraPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, photos: extraPhotos }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || dict.common.somethingWrong);
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="auth-form-panel" style={{ minHeight: "100vh" }}>
      <form onSubmit={handleSubmit}>
        <h2>{t.addTitle}</h2>
        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label>{t.brand}</label>
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder={t.brandPlaceholder} required />
        </div>
        <div className="field">
          <label>{t.model}</label>
          <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder={t.modelPlaceholder} required />
        </div>
        <div className="field">
          <label>{t.year}</label>
          <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder={t.yearPlaceholder} required />
        </div>
        <div className="field">
          <label>{t.category}</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t.categoryPlaceholder} required />
        </div>
        <div className="field">
          <label>{t.pricePerDay}</label>
          <input type="number" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} required />
        </div>
        <div className="field">
          <label>{t.transmission}</label>
          <select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: "5px", border: "1.5px solid #D8D5CC" }}>
            <option value="Automatic">{dict.cars.automatic}</option>
            <option value="Manual">{dict.cars.manual}</option>
          </select>
        </div>
        <div className="field">
          <label>{t.seats}</label>
          <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} required />
        </div>
        <div className="field">
          <label>{t.coverPhoto}</label>
          <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} locale={locale} />
        </div>

        <div className="field">
          <label>{t.additionalPhotos}</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
            {extraPhotos.map((url, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img src={url} alt="" style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "5px" }} />
                <button
                  type="button"
                  onClick={() => setExtraPhotos(extraPhotos.filter((_, idx) => idx !== i))}
                  style={{ position: "absolute", top: "-6px", right: "-6px", background: "#B3432B", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <ImageUpload value="" onChange={(url) => setExtraPhotos([...extraPhotos, url])} locale={locale} />
        </div>

        <button type="submit" className="submit-btn">{t.listCar}</button>
      </form>
    </div>
  );
}
