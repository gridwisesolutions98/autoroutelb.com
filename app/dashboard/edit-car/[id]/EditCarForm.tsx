"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "../../add-car/ImageUpload";
import { getDictionary, type Locale } from "@/lib/i18n";

type Photo = { id: string; url: string };
type Car = {
  id: string; brand: string; model: string; year: number | null; category: string; pricePerDay: number;
  transmission: string; seats: number; image: string; isRented: boolean;
  photos: Photo[];
};

export default function EditCarForm({ car, locale }: { car: Car; locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.carForm;
  const [form, setForm] = useState({
    brand: car.brand,
    model: car.model,
    year: car.year ? String(car.year) : "",
    category: car.category,
    pricePerDay: String(car.pricePerDay),
    transmission: car.transmission,
    seats: String(car.seats),
    image: car.image,
  });
  const [photos, setPhotos] = useState(car.photos);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/cars/${car.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError(dict.common.somethingWrong); return; }
    router.push("/dashboard");
  };

  const removePhoto = async (photoId: string) => {
    await fetch(`/api/cars/${car.id}/photos/${photoId}`, { method: "DELETE" });
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  return (
    <div className="auth-form-panel" style={{ minHeight: "100vh" }}>
      <form onSubmit={handleSave} style={{ maxWidth: "480px" }}>
        <h2>{t.editTitle}</h2>
        {error && <div className="error-msg">{error}</div>}

        <div className="field">
          <label>{t.brand}</label>
          <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
        </div>
        <div className="field">
          <label>{t.model}</label>
          <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
        </div>
        <div className="field">
          <label>{t.year}</label>
          <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
        </div>
        <div className="field">
          <label>{t.category}</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
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

        <button type="submit" className="submit-btn">{dict.common.save}</button>
      </form>

      <div style={{ maxWidth: "480px", marginTop: "40px" }}>
        <h3 style={{ fontSize: "1rem" }}>{t.additionalPhotos}</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: "relative" }}>
              <img src={p.url} alt="" style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "5px" }} />
              <button
                onClick={() => removePhoto(p.id)}
                style={{ position: "absolute", top: "-6px", right: "-6px", background: "#B3432B", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "12px" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <ImageUpload
  value=""
  onChange={async (url) => {
    const res = await fetch(`/api/cars/${car.id}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (res.ok) setPhotos([...photos, data.photo]);
  }}
  locale={locale}
/>
      </div>
    </div>
  );
}
