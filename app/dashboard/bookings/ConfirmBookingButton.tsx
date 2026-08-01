"use client";
import { useRouter } from "next/navigation";

export default function ConfirmBookingButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  return (
    <button
      className="submit-btn"
      style={{ marginTop: "10px", width: "auto", padding: "8px 16px" }}
      onClick={async () => {
        await fetch(`/api/bookings/${id}/confirm`, { method: "POST" });
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
