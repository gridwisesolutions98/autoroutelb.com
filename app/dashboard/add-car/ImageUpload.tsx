"use client";
import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function ImageUpload({ value, onChange, locale }: { value: string; onChange: (url: string) => void; locale: Locale }) {
  const t = getDictionary(locale).carForm;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    onChange(data.url);
  };

  return (
    <div>
      {value && <img src={value} alt="preview" style={{ width: "140px", height: "100px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px", transition: "transform 0.3s var(--ease-out)" }} />}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {uploading && <p className="car-meta"><span className="spinner" />{t.uploading}</p>}
      {error && <div className="error-msg" style={{ marginTop: "8px" }}>{error}</div>}
    </div>
  );
}
