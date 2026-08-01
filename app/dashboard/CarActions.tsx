"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function CarActions({ carId, isRented, locale }: { carId: string; isRented: boolean; locale: Locale }) {
  const t = getDictionary(locale).dashboard;
  const router = useRouter();

  const toggleRented = async () => {
    await fetch(`/api/cars/${carId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRented: !isRented }),
    });
    router.refresh();
  };

  const removeCar = async () => {
    if (!confirm(t.removeConfirm)) return;
    await fetch(`/api/cars/${carId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
      <Link href={`/dashboard/edit-car/${carId}`} className="toggle-link" style={{ margin: 0 }}>
        {t.edit}
      </Link>
      <button onClick={toggleRented} className="toggle-link" style={{ margin: 0, background: "none", border: "none" }}>
        {isRented ? t.markAvailable : t.markRented}
      </button>
      <button onClick={removeCar} className="toggle-link" style={{ margin: 0, color: "#B3432B" }}>
        {t.remove}
      </button>
    </div>
  );
}
